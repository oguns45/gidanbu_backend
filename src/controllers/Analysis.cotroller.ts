import { ObjectId } from "mongoose";
// import Order from "../models/Payment.model";
import Product from "../models/Product.model";
import User from "../models/User.model";

// Analytics data type definition
interface AnalyticsData {
  users: number;
  products: number;
  totalSales: number;
  totalRevenue: number;
}

// Daily sales data type definition
interface DailySalesData {
  date: string;
  sales: number;
  revenue: number;
}

// export const getAnalyticsData = async (): Promise<AnalyticsData> => {
//   const totalUsers = await User.countDocuments();
//   const totalProducts = await Product.countDocuments();

//   const salesData = await Order.aggregate([
//     {
//       $group: {
//         _id: null, // Groups all documents together
//         totalSales: { $sum: 1 },
//         totalRevenue: { $sum: "$totalAmount" },
//       },
//     },
//   ]);

//   const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

//   return {
//     users: totalUsers,
//     products: totalProducts,
//     totalSales,
//     totalRevenue,
//   };
// };

// export const getDailySalesData = async (
//   startDate: Date,
//   endDate: Date
// ): Promise<DailySalesData[]> => {
//   try {
//     const dailySalesData = await Order.aggregate([
//       {
//         $match: {
//           createdAt: {
//             $gte: startDate,
//             $lte: endDate,
//           },
//         },
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           sales: { $sum: 1 },
//           revenue: { $sum: "$totalAmount" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     const dateArray = getDatesInRange(startDate, endDate);

//     return dateArray.map((date) => {
//       // const foundData = dailySalesData.find((item) => item._id === date);

//       return {
//         date,
//         // sales: foundData?.sales || 0,
//         revenue: foundData?.revenue || 0,
//       };
//     });
//   } catch (error) {
//     throw new Error(`Error fetching daily sales data: ${(error as Error).message}`);
//   }
// };

function getDatesInRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
