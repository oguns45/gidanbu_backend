// import { Response } from 'express';
// import { axiosInstance } from '../config/paystack';
// import Coupon from '../models/Coupon.model';
// import Order from '../models/Order.model';
// import { IPaystackMetadata } from '../utils/interface.util';
// import { IProduct, CustomRequest } from '../utils/interface_payment.util'; // Ensure IProduct is imported correctly
// import Cart from '../models/Cart.model'; // Import Cart model

// // Create a checkout session
// export const createCheckoutSession = async (req: CustomRequest, res: Response): Promise<void> => {
//   try {
//     const { couponCode }: { couponCode?: string } = req.body;

//     // Ensure the user is authenticated
//     if (!req.user) {
//       res.status(401).json({ error: 'Unauthorized - User not found' });
//       return;
//     }

//     // Fetch the total amount from the cart (already calculated in Cart Controller)
//     // const cart = await Cart.findOne({ userId: req.user._id });
//     const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId"); // Populate the productId field
//     if (!cart) {
//       res.status(400).json({ error: 'Cart not found' });
//       return;
//     }
    

//     const totalAmount = cart.totalAmount; // Get pre-calculated totalAmount

//     // Fetch the products in the cart
//     const products = cart.items.map((item) => item.productId); // Assuming productId is populated in cart
//     if (!products || products.length === 0) {
//       res.status(400).json({ error: 'No products in the cart' });
//       return;
//     }

//     // Create a Paystack transaction
//     const payload = {
//       email: req.user.email,
//       amount: totalAmount * 100, // Convert to kobo
//       currency: 'NGN',
//       callback_url: `${process.env.CLIENT_URL}/purchase-success`,
//       metadata: {
//         userId: req.user._id.toString(),
//         couponCode: couponCode || '',
//         products: JSON.stringify(
//           products.map((product: IProduct) => ({
//             id: product._id,
//             quantity: 1,  // Quantity is assumed to be 1 (adjust if necessary)
//             price: product.price,
//           }))
//         ),
//       } as IPaystackMetadata,
//     };

//     const response = await axiosInstance.post('/transaction/initialize', payload);

//     res.status(200).json({
//       authorization_url: response.data.data.authorization_url,
//       totalAmount: totalAmount, // Use the pre-calculated totalAmount
//     });
//   } catch (error) {
//     console.error('Error processing checkout:', error);
//     res.status(500).json({ message: 'Error processing checkout', error });
//   }
// };

// // Handle successful checkout
// export const checkoutSuccess = async (req: CustomRequest, res: Response): Promise<void> => {
//   try {
//     const { reference } = req.query;
//     if (!reference) {
//       res.status(400).json({ error: 'Reference is required' });
//       return;
//     }

//     const verificationResponse = await axiosInstance.get(`/transaction/verify/${reference}`);

//     if (verificationResponse.data.data.status === 'success') {
//       const session = verificationResponse.data.data;
//       const products: IProduct[] = JSON.parse(session.metadata.products);

//       // Deactivate the coupon if used
//       if (session.metadata.couponCode) {
//         await Coupon.findOneAndUpdate(
//           { code: session.metadata.couponCode, userId: session.metadata.userId },
//           { isActive: false }
//         );
//       }

//       // Create order
//       const newOrder = new Order({
//         user: session.metadata.userId,
//         products: products.map((product) => ({
//           product: product.id,
//           quantity: product.quantity,
//           price: product.price,
//         })),
//         totalAmount: session.amount / 100, // Convert from kobo to naira
//         paystackReference: reference,
//       });

//       await newOrder.save();

//       res.status(200).json({
//         success: true,
//         message: 'Payment successful, order created, and coupon deactivated if used.',
//         orderId: newOrder._id,
//       });
//     } else {
//       res.status(400).json({ error: 'Payment not successful' });
//     }
//   } catch (error) {
//     console.error('Error processing successful checkout:', error);
//     res.status(500).json({ message: 'Error processing successful checkout', error });
//   }
// };



import { Response } from 'express';
import { axiosInstance } from '../config/paystack';
import Order from '../models/Order.model';
import { IPaystackMetadata } from '../utils/interface.util';
import { IProduct, CustomRequest } from '../utils/interface_payment.util';

// Create a checkout session
export const createCheckoutSession = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { products, totalAmount = 0 }: { products: IProduct[]; totalAmount: number } = req.body;


    // Validate products and totalAmount
    if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({ error: 'Invalid or empty products array' });
      return;
    }
    if (!totalAmount || totalAmount <= 0) {
      res.status(400).json({ error: 'Invalid totalAmount' });
      return;
    }

    // Ensure the user is authenticated
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized - User not found' });
      return;
    }

    // Create a Paystack transaction
    const payload = {
      email: req.user.email,
      amount: totalAmount * 100, // Convert to kobo
      currency: 'NGN',
      callback_url: `${process.env.CLIENT_URL}/purchase-success`,
      metadata: {
        userId: req.user._id.toString(),
        products: JSON.stringify(products.map((p) => ({
          id: p._id,
          quantity: p.quantity,
          price: p.price,
        }))),
      } as IPaystackMetadata,
    };

    const response = await axiosInstance.post('/transaction/initialize', payload);

    res.status(200).json({
      authorization_url: response.data.data.authorization_url,
      totalAmount: totalAmount, // Use the totalAmount directly from frontend
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({ message: 'Error processing checkout', error });
  }
};

// Handle successful checkout
// export const checkoutSuccess = async (req: CustomRequest, res: Response): Promise<void> => {
//   try {
//     const { reference } = req.query;
//     if (!reference) {
//       res.status(400).json({ error: 'Reference is required' });
//       return;
//     }

//     // Verify the Paystack transaction
//     const verificationResponse = await axiosInstance.get(/transaction/verify/${reference});

//     if (verificationResponse.data.data.status === 'success') {
//       const session = verificationResponse.data.data;
//       const products = JSON.parse(session.metadata.products); // Get the product details

//       // Create an order based on the successful payment
//       const newOrder = new Order({
//         user: session.metadata.userId,
//         products: products.map((product) => ({
//           product: product.id,
//           quantity: product.quantity,
//           price: product.price,
//         })),
//         totalAmount: session.amount / 100, // Use the total amount from Paystack transaction
//         paystackReference: reference,
//       });

//       await newOrder.save();

//       res.status(200).json({
//         success: true,
//         message: 'Payment successful and order created.',
//         orderId: newOrder._id,
//       });
//     } else {
//       res.status(400).json({ error: 'Payment not successful' });
//     }
//   } catch (error) {
//     console.error('Error processing successful checkout:', error);
//     res.status(500).json({ message: 'Error processing successful checkout', error });
//   }
// };
// Handle successful checkout
export const checkoutSuccess = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { reference } = req.query;
    if (!reference) {
      res.status(400).json({ error: 'Reference is required' });
      return;
    }

    // Verify the Paystack transaction
    const verificationResponse = await axiosInstance.get(`/transaction/verify/${reference}`);

    if (verificationResponse.data.data.status === 'success') {
      const session = verificationResponse.data.data;

      // Parse and type the products metadata
      const products: IProduct[] = JSON.parse(session.metadata.products);

      // Create an order based on the successful payment
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product: IProduct) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount / 100, // Use the total amount from Paystack transaction
        paystackReference: reference,
      });

      await newOrder.save();

      res.status(200).json({
        success: true,
        message: 'Payment successful and order created.',
        orderId: newOrder._id,
      });
    } else {
      res.status(400).json({ error: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Error processing successful checkout:', error);
    res.status(500).json({ message: 'Error processing successful checkout', error });
  }
};






















// const checkout = async () => {
//     const products = JSON.parse(localStorage.getItem('cartProducts') || '[]');
//     const totalAmount = parseFloat(localStorage.getItem('totalAmount') || '0');
  
//     if (!totalAmount || totalAmount <= 0) {
//       alert('Invalid total amount');
//       return;
//     }
  
//     const response = await fetch('/api/checkout-session', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ products, totalAmount }),
//     });
  
//     const data = await response.json();
  
//     if (data.authorization_url) {
//       window.location.href = data.authorization_url;
//     } else {
//       alert('Failed to initiate checkout');
//     }
//   };
  