import mongoose, { Schema, Document, Model } from "mongoose";

// Interface for product details within an order
interface IOrderProduct {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

// Interface for the order schema
export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  products: IOrderProduct[];
  totalAmount: number;
  stripeSessionId?: string; // Optional field
  createdAt: Date;
  updatedAt: Date;
}

// Order schema definition
const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    stripeSessionId: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Create the Order model
const Order: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema);

export default Order;
