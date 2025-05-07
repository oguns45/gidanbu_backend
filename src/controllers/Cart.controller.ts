
// Import necessary modules and models
import { Request, Response } from "express";
import Product from "../models/Product.model";
import Cart from "../models/Cart.model";
import Coupon from "../models/Coupon.model";
import { IUser } from "../utils/interface.util";

// Get all products in the user's cart and compute the total amount
// export const getCartProducts = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const user = req.user as IUser | undefined; // Extract the authenticated user from the request

//     if (!user) {
//       res.status(401).json({ message: "User not authenticated" }); // Return error if user is not authenticated
//       return;
//     }

//     // Find the cart associated with the user and populate product details
//     const cart = await Cart.findOne({ userId: user._id }).populate("items.productId");

//     if (!cart) {
//       res.status(404).json({ message: "Cart not found" }); // Return error if cart does not exist
//       return;
//     }

//     let totalAmount = 0; // Initialize total amount

//     // Map over cart items to calculate total price
//     const cartItems = cart.items.map((item) => {
//       const product = item.productId as any; // Type assertion to access product properties
//       const productTotal = product.price * item.quantity; // Calculate total price for each item
//       totalAmount += productTotal; // Add to total amount
//       return {
//         product,
//         quantity: item.quantity,
//         productTotal,
//       };
//     });

//     // Return the cart details and total amount
//     res.json({
//       items: cartItems,
//       totalAmount,
//     });
//   } catch (error: any) {
//     console.error("Error in getCartProducts controller:", error.message);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


export const getCartProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    // Find the cart and populate the product details
    const cart = await Cart.findOne({ userId: userId }).populate("items.productId");

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    let totalAmount = 0;

    // Map through the cart items and calculate the total amount
    const cartItems = cart.items.map((item) => {
      const product = item.productId as any; // Populated product
      const productTotal = product.price * item.quantity;
      totalAmount += productTotal;
      return {
        product,
        quantity: item.quantity,
        productTotal,
      };
    });

    res.json({
      items: cartItems,
      totalAmount,
    });
  } catch (error: any) {
    console.error("Error in getCartProducts controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Add a product to the user's cart and recalculate the total amount
export const addToCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.body; // Get product ID from request body
    const user = req.user as IUser | undefined;

    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const product = await Product.findById(productId); // Check if product exists
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    let cart = await Cart.findOne({ userId: user._id }); // Find user's cart

    if (!cart) {
      // Create new cart if not found
      cart = new Cart({
        userId: user._id,
        items: [{ productId, quantity: 1 }],
      });
    } else {
      // Check if product is already in the cart
      const existingItem = cart.items.find((item) => item.productId.toString() === productId);

      if (existingItem) {
        existingItem.quantity += 1; // Increment quantity if already in cart
      } else {
        cart.items.push({ productId, quantity: 1 }); // Add new product
      }
    }

    await cart.save(); // Save cart to database

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
    console.error("Error in addToCart controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const removeAllFromCart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.body;
    const user = req.user as IUser | undefined;

    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const cart = await Cart.findOne({ userId: user._id }); // Find user's cart

    if (!cart) {
      res.status(404).json({ message: "Cart not found" });
      return;
    }

    if (!productId) {
      res.status(400).json({ message: "Product ID is required" }); // Updated error message
      return;
    }

    if (cart.items.length === 0) {
      res.status(404).json({ message: "Cart is empty" });
      return;
    }

    // Remove specific product
    const initialItemCount = cart.items.length;
    cart.items = cart.items.filter((item) => item.productId.toString() !== productId);

    if (cart.items.length === initialItemCount) {
      res.status(404).json({ message: "Product not found in cart" });
      return;
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
    console.error("Error in removeAllFromCart controller:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// Update the quantity of a product in the cart and recalculate the total amount
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