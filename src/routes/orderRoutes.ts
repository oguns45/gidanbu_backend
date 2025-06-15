import express from "express";
import {
  createOrder,
  getOrderById,
  approveOrderPayment,
  declineOrderPayment,
  getMyOrders,
  getOrders,
} from "../controllers/orderController";
import { protectRoute } from "../middleware/auth.mw";

const router = express.Router();

// Create and get all orders
router.post("/orders", protectRoute, createOrder);
router.get("/orders", protectRoute, getOrders);

// Get logged-in user's orders
router.get("/orders/my", protectRoute, getMyOrders);

// Get a specific order by ID
router.get("/orders/:id", protectRoute, getOrderById);

// Approve order payment
router.patch("/orders/:id/approve", protectRoute, approveOrderPayment);

// Decline order payment
router.patch("/orders/:id/decline", protectRoute, declineOrderPayment);

export default router;
