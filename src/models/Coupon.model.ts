import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for the Coupon schema
export interface ICoupon extends Document {
  code: string;
  discountPercentage: number;
  expirationDate: Date;
  isActive: boolean;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Coupon schema definition
const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the Coupon model
const Coupon: Model<ICoupon> = mongoose.model<ICoupon>("Coupon", couponSchema);

export default Coupon;
