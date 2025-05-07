import express from "express";
import { protectRoute } from "../middleware/auth.mw";
import { getCoupon, validateCoupon, createCoupon } from "../controllers/Coupon.controller";

const router = express.Router();

router.get("/coupons", protectRoute, getCoupon);
router.post("/coupons/validate", protectRoute, validateCoupon);
router.post("/coupons/create", protectRoute, createCoupon); // Added missing route

export default router;
