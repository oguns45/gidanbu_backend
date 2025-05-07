import { RequestHandler, Request, Response } from "express";
import Coupon from "../models/Coupon.model";
import { CustomRequest } from "../utils/interface.util";

// Define an interface for the coupon validation request body
interface CouponValidationRequest {
  code: string;
}

interface CouponRequestBody {
  code: string;
  discountPercentage: number;
  expirationDate: string; // Ensure it's recognized as a string before conversion
}


// Helper function to handle errors consistently
const handleError = (res: Response, message: string, status: number, error?: string): void => {
  console.error(message, error);
  res.status(status).json({ message, error });
};

// Create a coupon
export const createCoupon: RequestHandler = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return handleError(res, "Unauthorized - User not found", 401);
    }

    // Optional: Restrict coupon creation to admin users
    if (req.user.role !== "admin") {
      return handleError(res, "Forbidden - Only admins can create coupons", 403);
    }

    const { code, discountPercentage, expirationDate }:CouponRequestBody = req.body;

    if (!code || !discountPercentage || !expirationDate) {
      return handleError(res, "All fields are required (code, discountPercentage, expirationDate)", 400);
    }

    // Ensure the coupon code is unique
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return handleError(res, "Coupon code already exists", 409);
    }

    // Create the new coupon
    const newCoupon = new Coupon({
      code,
      discountPercentage,
      expirationDate: new Date(expirationDate),
      isActive: true,
      userId: req.user._id, // Assuming the user is the creator
    });

    await newCoupon.save();

    res.status(201).json({
      message: "Coupon created successfully",
      coupon: {
        code: newCoupon.code,
        discountPercentage: newCoupon.discountPercentage,
        expirationDate: newCoupon.expirationDate,
        isActive: newCoupon.isActive,
      },
    });
  } catch (error) {
    handleError(res, "Server error in createCoupon controller", 500, (error as Error).message);
  }
};

// Get the active coupon for a user
export const getCoupon: RequestHandler = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return handleError(res, "Unauthorized - User not found", 401);
    }

    const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
    if (!coupon) {
      res.json(null); // No active coupon found
      return;
    }

    res.json(coupon);
  } catch (error) {
    handleError(res, "Server error in getCoupon controller", 500, (error as Error).message);
  }
};

// Validate coupon code for a user
export const validateCoupon: RequestHandler = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      return handleError(res, "Unauthorized - User not found", 401);
    }

    const { code }: CouponValidationRequest = req.body;

    if (!code) {
      return handleError(res, "Coupon code is required", 400);
    }

    const coupon = await Coupon.findOne({ code, userId: req.user._id, isActive: true });
    console.log("coupon", coupon);

    if (!coupon) {
      return handleError(res, "Coupon not found", 404);
    }

    if (coupon.expirationDate < new Date()) {
      coupon.isActive = false;
      await coupon.save();
      return handleError(res, "Coupon expired", 404);
    }

    res.json({
      message: "Coupon is valid",
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    handleError(res, "Server error in validateCoupon controller", 500, (error as Error).message);
  }
};
