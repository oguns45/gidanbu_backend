import express, { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getFeaturedProducts,
  getProductsByCategory,
  getRecommendedProducts,
  toggleFeaturedProduct,
  getProduct,
} from "../controllers/product.controller";
import { adminRoute, protectRoute } from "../middleware/auth.mw";

const router: Router = express.Router();

/**
 * @route   GET /products
 * @desc    Retrieve all products (Admin only)
 * @access  Protected (Admin)
 */
router.get("/products", protectRoute, adminRoute, getAllProducts);



/**
 * @route   GET /products/featured
 * @desc    Retrieve featured products
 * @access  Public
 */
router.get("/products/featured", getFeaturedProducts);

/**
 * @route   GET /products/category/:category
 * @desc    Retrieve products by category
 * @access  Public
 */

router.get("/products/category/:category", getProductsByCategory);
/**
 * @route   GET /products/recommendations
 * @desc    Retrieve recommended products
 * @access  Public
 */

router.get("/products/recommendations", getRecommendedProducts);


/**
 * @route   POST /products
 * @desc    Create a new product (Admin only)
 * 
 * @access  Protected (Admin)
 */
router.post("/products/addpro", protectRoute, adminRoute, createProduct);

/**
 * @route   PATCH /products/:id
 * @desc    Toggle featured status for a product (Admin only)
 * @access  Protected (Admin)
 */
router.patch("/products/featured_change/:id", protectRoute, adminRoute, toggleFeaturedProduct);

/**
 * @route   DELETE /products/:id
 * @desc    Delete a product (Admin only)
 * @access  Protected (Admin)
 */
router.delete("/products/delete/:id", protectRoute, adminRoute, deleteProduct);

export default router;


/**
 * @route   GET /product
 * @desc    Retrieve all products (Admin only)
 * @access  Protected (Admin)
 */
router.get("/products/:id", getProduct);
