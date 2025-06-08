import { Request, Response, NextFunction } from "express";
import { redis } from "../config/redis";
import cloudinary from "../config/cloudinary";
import Product from "../models/Product.model";

interface CreateProductBody {
    name: string;
    description: string;
    price: number;
    image?: string;
    category: string;
  }
  
  export const createProduct = async (
    req: Request<{}, {}, CreateProductBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, description, price, image, category } = req.body;
  
      if (!name || !description || !price || !category) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      let cloudinaryResponse = null;
      if (image) {
        try {
          console.log("Uploading image to Cloudinary...");
          cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
          console.log("Cloudinary Response:", cloudinaryResponse);
        } catch (uploadError: any) {
          console.error("Cloudinary Upload Error:", uploadError);
          return res.status(400).json({
            message: "Failed to upload image",
            error: uploadError.message,
          });
        }
      }
  
      const product = await Product.create({
        name,
        description,
        price,
        image: cloudinaryResponse?.secure_url || "",
        category,
      });
  
      res.status(201).json(product);
    } catch (error: any) {
      console.error("Error in createProduct:", error);
      next(error);
    }
  };
  

export const getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({}); // find all products
    res.json({ products });
  } catch (error: any) {
    console.error("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


export const getProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);// find all products
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return; // Ensure the function exits after sending a response
    }

    await redis.set("product", JSON.stringify(product));
    res.json(product);
  } catch (error: any) {
    console.error("Error in getAllProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProduct = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return; // Ensure the function exits after sending a response
    }

    if (product.image) {
      const publicId = product.image.split("/").pop()?.split(".")[0];
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(`products/${publicId}`);
          console.log("Deleted image from Cloudinary");
        } catch (error: any) {
          console.error("Error deleting image from Cloudinary", error.message);
        }
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Error in deleteProduct controller", error.message);
    next(error); // Pass the error to the error-handling middleware
  }
};



export const getFeaturedProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check Redis cache for featured products
    let featuredProducts: string | null = await redis.get("featured_products");

    if (featuredProducts) {
      // Parse and return the cached products
      res.json(JSON.parse(featuredProducts));
      return; // Ensure the function exits after sending a response
    }

    // Fetch from MongoDB if not cached
    const products = await Product.find({ isFeatured: true }).lean();

    if (!products || products.length === 0) {
      res.status(404).json({ message: "No featured products found" });
      return; // Ensure the function exits after sending a response
    }

    // Serialize the array of products to a string for caching
    featuredProducts = JSON.stringify(products);
    await redis.set("featured_products", featuredProducts);

    res.json(products);
  } catch (error: any) {
    console.error("Error in getFeaturedProducts controller", error.message);
    next(error); // Pass the error to the error-handling middleware
  }
};





export const getRecommendedProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.aggregate([
      { $sample: { size: 4 } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          image: 1,
          price: 1,
        },
      },
    ]);

    res.json(products);
  } catch (error: any) {
    console.error("Error in getRecommendedProducts controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProductsByCategory = async (
    req: Request<{ category: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { category } = req.params;
  
      // Log the received category for debugging
      console.log("Category received:", category);
  
      // Sanitize and perform a case-insensitive search
      const sanitizedCategory = category.trim();
      const products = await Product.find({ category: new RegExp(`^${sanitizedCategory}$`, "i") });
  
      if (products.length === 0) {
        return res.status(404).json({ message: "No products found in this category" });
      }
  
      res.json({ products });
    } catch (error: any) {
      console.error("Error in getProductsByCategory controller", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };
  
export const toggleFeaturedProduct = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      product.isFeatured = !product.isFeatured;
      const updatedProduct = await product.save();
      await updateFeaturedProductsCache();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error: any) {
    console.error("Error in toggleFeaturedProduct controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Helper function
async function updateFeaturedProductsCache() {
  try {
    const featuredProducts = await Product.find({ isFeatured: true }).lean();
    await redis.set("featured_products", JSON.stringify(featuredProducts));
  } catch (error: any) {
    console.error("Error in update cache function:", error.message);
  }
}