import mongoose, { Schema, Document } from 'mongoose';
import { IProduct } from '../utils/interface.util'; // Adjust path accordingly

interface ICartItem {
  productId: mongoose.Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  totalAmount: number;  // Add this if you want it to be a property

  // Optional method to calculate totalAmount dynamically
  calculateTotalAmount(): number;
}

const CartItemSchema = new Schema<ICartItem>({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
});

const CartSchema = new Schema<ICart>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [CartItemSchema],
});

// Virtual to calculate totalAmount dynamically
CartSchema.virtual('totalAmount').get(function (this: ICart) {
  return this.items.reduce((total, item) => {
    total += (item.productId as any).price * item.quantity; // Assuming you populate productId to access the price
    return total;
  }, 0);
});

const Cart = mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
