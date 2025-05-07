import express from "express";
import { protectRoute } from "../middleware/auth.mw";
import { checkoutSuccess, createCheckoutSession } from "../controllers/paymentController";

const router = express.Router();

router.post("/create-checkout-session", protectRoute, createCheckoutSession);
router.post("/checkout-success", protectRoute, checkoutSuccess);

export default router;
