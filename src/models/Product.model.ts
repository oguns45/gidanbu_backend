import mongoose, { Model } from "mongoose";
import { IProduct } from "../utils/interface.util";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    description: {
      type: String, // Corrected spelling
      required: true,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    category: {
      type: String,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Automatically handle createdAt and updatedAt
);

const Product: Model<IProduct> = mongoose.model<IProduct>("Product", productSchema);

export default Product;
