
// Import necessary modules and models
import { Request, Response } from "express";
import Product from "../models/Product.model";
import Cart from "../models/Cart.model";
import Coupon from "../models/Coupon.model";
import { IUser } from "../utils/interface.util";
import { redis } from "../config/redis";

export const getCartProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Find the cart and populate product details
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    let totalAmount = 0;

    // Filter out items where product data is missing
    const validItems = cart.items.filter(item => item.productId !== null);

    // Log any missing products (for debugging)
    if (validItems.length < cart.items.length) {
      console.warn(
        `⚠️ Some cart items for user ${userId} have invalid or deleted product references.`
      );
    }

    const cartItems = validItems.map(item => {
      const product = item.productId as any; // Populated product
      const productTotal = (product?.price || 0) * item.quantity;
      totalAmount += productTotal;

      return {
        product,
        quantity: item.quantity,
        productTotal,
      };
    });

    // Cache in Redis (optional)
    try {
      await redis.set(`cart_${userId}`, JSON.stringify(cartItems));
      console.log(`🧠 Cached cart items for user ${userId} in Redis`);
    } catch (cacheError: any) {
      console.warn("Redis caching skipped:", cacheError.message);
    }

    res.json({
      items: cartItems,
      totalAmount,
    });

  } catch (error: any) {
    console.error("❌ Error in getCartProducts controller:", error);
    res.status(500).json({
      message: "Server error while fetching cart",
      error: error.message,
    });
  }
};

export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    const user = req.user as IUser | undefined;

    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Find or create user's cart
    let cart = await Cart.findOne({ userId: user._id });
    if (!cart) {
      cart = new Cart({
        userId: user._id,
        items: [{ productId, quantity: 1 }],
      });
    } else {
      // Check if product already exists
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ productId, quantity: 1 });
      }
    }

    await cart.save();

    // ✅ Recalculate safely
    const updatedCart = await Cart.findOne({ userId: user._id }).populate("items.productId");
    let totalAmount = 0;

    updatedCart?.items.forEach((item) => {
      const productDoc = item.productId as any;

      // ✅ Safety check: skip if product missing
      if (!productDoc || !productDoc.price) {
        console.warn("⚠️ Missing product info for cart item:", item);
        return;
      }

      totalAmount += productDoc.price * (item.quantity ?? 0);
    });

    res.json({
      cart: updatedCart,
      totalAmount,
    });
  } catch (error: any) {
    console.error("Error in addToCart controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// export const removeAllFromCart = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { productId } = req.body;
//     const user = req.user as IUser | undefined;

//     if (!user) {
//       res.status(401).json({ message: "User not authenticated" });
//       return;
//     }

//     const cart = await Cart.findOne({ userId: user._id }); // Find user's cart

//     if (!cart) {
//       res.status(404).json({ message: "Cart not found" });
//       return;
//     }

//     if (!productId) {
//       res.status(400).json({ message: "Product ID is required" }); // Updated error message
//       return;
//     }

//     if (cart.items.length === 0) {
//       res.status(404).json({ message: "Cart is empty" });
//       return;
//     }

//     // Remove specific product
//     const initialItemCount = cart.items.length;
//     cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

//     if (cart.items.length === initialItemCount) {
//       res.status(404).json({ message: "Product not found in cart" });
//       return;
//     }

//     await cart.save(); // Save updated cart

//     // Recalculate total amount
//     const updatedCart = await Cart.findOne({ userId: user._id }).populate("items.productId");
//     let totalAmount = 0;
//     updatedCart?.items.forEach((item) => {
//       const product = item.productId as any;
//       totalAmount += product.price * item.quantity;
//     });

//     res.json({
//       cart: updatedCart,
//       totalAmount,
//     });
//   } catch (error: any) {
//     console.error("Error in removeAllFromCart controller:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
// Update the quantity of a product in the cart and recalculate the total amount

export const removeAllFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds } = req.body;
    const user = req.user as IUser | undefined;

    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    if (!Array.isArray(productIds) || productIds.length === 0) {
      res.status(400).json({ message: "Product IDs are required" });
      return;
    }

    const cart = await Cart.findOne({ userId: user._id });

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    if (cart.items.length === 0) {
      res.status(404).json({ message: "Cart is empty" });
      return;
    }

    const initialItemCount = cart.items.length;

    cart.items = cart.items.filter(
      (item) => !productIds.includes(item.productId.toString())
    );

    if (cart.items.length === initialItemCount) {
      res.status(404).json({ message: "No matching products found in cart" });
      return;
    }

    await cart.save();

    const updatedCart = await Cart.findOne({ userId: user._id }).populate("items.productId");
    let totalAmount = 0;
    updatedCart?.items.forEach((item) => {
      const product = item.productId as any;
      totalAmount += product.price * item.quantity;
    });

    res.json({
      cart: updatedCart,
      totalAmount,
    });
  } catch (error: any) {
    console.error("Error in removeAllFromCart controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const updateQuantity = async (req: Request, res: Response): Promise<void> => {
  const { id: productId } = req.params;
  const { quantity } = req.body;
  const user = req.user as IUser | undefined;

  try {
    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const cart = await Cart.findOne({ userId: user._id }); // Find user's cart

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    // Find the item in the cart
    const existingItem = cart.items.find((item) => item.productId.toString() === productId);

    if (!existingItem) {
      res.status(404).json({ message: "Product not found in cart" });
      return;
    }

    if (quantity === 0) {
      // Remove item if quantity is set to 0
      cart.items = cart.items.filter((item) => item.productId.toString() !== productId);
    } else {
      existingItem.quantity = quantity; // Update quantity
    }

    await cart.save(); // Save updated cart

    // Recalculate total amount
    const updatedCart = await Cart.findOne({ userId: user._id }).populate("items.productId");
    let totalAmount = 0;
    updatedCart?.items.forEach((item) => {
      const product = item.productId as any;
      totalAmount += product.price * item.quantity;
    });

    res.json({
      cart: updatedCart,
      totalAmount,
    });
  } catch (error: any) {
    console.error("Error in updateQuantity controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};





// Ensure TypeScript recognizes the custom type definition:

// Make sure your tsconfig.json includes the types directory in the typeRoots or include section. For example:

// {
//     "compilerOptions": {
//       "typeRoots": ["./node_modules/@types", "./types"]
//     },
//     "include": ["src/**/*", "types/**/*"]
//   }