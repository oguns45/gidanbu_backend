import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface IShippingAddress {
  address: string;
  state: string;
  accountName: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentStatus: 'pending' | 'approved' | 'rejected';
  totalAmount: number;
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentProof?: string;
  rejectionReason?: string;
  createdAt: Date;
}

const OrderSchema: Schema = new Schema<IOrder>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: false // Temporarily make optional for debugging
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: false } // Temporarily make optional
  }],
  shippingAddress: {
    address: { type: String, required: true },
    state: { type: String, required: true },
    accountName: { type: String, required: true }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  totalAmount: { type: Number, required: true },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  paymentProof: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  },
  stripeSessionId: {
    type: String,
    unique: true,
  }
});

// ✅ Safe export to prevent OverwriteModelError
export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
