import { Request, Response, NextFunction } from 'express';
import asyncHandler from "../middleware/async.mw";
import Order, { IOrder } from '../models/Order';
import { IUserDoc } from "../utils/interface.util";

interface AuthenticatedRequest extends Request {
  user: IUserDoc & { _id: string }; // Assumes you attach a `user` object with `_id`
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
// export const createOrder = asyncHandler(async (req, res) => {
//   const { items, shippingAddress, totalAmount } = req.body;

//   // Validate required fields
//   if (!items || items.length === 0) {
//     return res.status(400).json({ message: 'Order items are required' });
//   }
//   if (!shippingAddress?.address || !shippingAddress?.state) {
//     return res.status(400).json({ message: 'Complete shipping address is required' });
//   }

//   const order = new Order({
//     user: req.user._id,
//     items, // Using correct field name
//     shippingAddress,
//     totalAmount,
//     // Other fields will use schema defaults
//   });

//   const createdOrder = await order.save();
//   res.status(201).json(createdOrder);
// });

export const createOrder = asyncHandler(async (req, res) => {
  try {
    const order = new Order({
      user: req.user._id,
      items: req.body.items,
      shippingAddress: req.body.shippingAddress,
      totalAmount: req.body.totalAmount,
    });

    // Validate before saving
    const validationError = order.validateSync();
    if (validationError) {
      console.error('Validation errors:', validationError.errors);
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: validationError.errors 
      });
    }

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/approve
// @access  Private/Admin
export const approveOrderPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.paymentStatus = 'approved';
    order.orderStatus = 'processing';

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

// @desc    Decline order payment
// @route   PUT /api/orders/:id/decline
// @access  Private/Admin
export const declineOrderPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { reason } = req.body; // Optional rejection reason
    const order = await Order.findById(req.params.id);
  
    if (order) {
      order.paymentStatus = 'rejected';
      (order as any).rejectionReason = reason || 'Payment not verified'; // Add this to your model for full type safety
  
      const updatedOrder = await order.save();
  
      // TODO: Send notification to user (email/push)
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  });

