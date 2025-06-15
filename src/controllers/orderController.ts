import { Request, Response, NextFunction } from 'express';
import asyncHandler from "../middleware/async.mw";
import Order, { IOrder } from '../models/Order.model';
import { redis } from "../config/redis";
import { IUserDoc } from "../utils/interface.util";


interface AuthenticatedRequest extends Request {
  user: IUserDoc & { _id: string }; // Assumes you attach a `user` object with `_id`
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { items, shippingAddress, totalAmount } = req.body;

  // Validate required fields
  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('Order items are required');
  }
  if (!shippingAddress?.address || !shippingAddress?.state) {
    res.status(400);
    throw new Error('Complete shipping address is required');
  }

  const order = new Order({
    user: req.user._id,
    items,
    shippingAddress,
    totalAmount,
    // Other fields will use schema defaults
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});


// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  // Optionally cache the order in Redis
  await redis.set(`order_${req.params.id}`, JSON.stringify(order));
  console.log(`Order ${req.params.id} cached in Redis`);

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
  if (!orders || orders.length === 0) {
    res.status(404);
    throw new Error('No orders found for this user');
  }
  // Populate user details for each order
  orders.forEach(order => {
    if (order.user) {
      (order as any).userName = order.user.name; // Add user name to each order
    }
  });
  // Optionally cache orders in Redis
  await redis.set(`user_orders_${req.user._id}`, JSON.stringify(orders));
  console.log(`Orders for user ${req.user._id} cached in Redis`);
  res.json(orders);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orders = await Order.find({}).populate('user', 'id name');
  if (!orders || orders.length === 0) {
    res.status(404);
    throw new Error('No orders found');
  }
  // Populate user details for each order
  orders.forEach(order => {
    if (order.user) {
      (order as any).userName = order.user.name; // Add user name to each order
    }
  });
  // Optionally cache orders in Redis
  await redis.set('all_orders', JSON.stringify(orders));
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

