import express from "express";
import { adminRoute, protectRoute } from "../middleware/auth.mw";
// import { getAnalyticsData, getDailySalesData } from "../controllers/Analysis.cotroller";

const router = express.Router();

// router.get("/analysis", protectRoute, adminRoute, async (req, res) => {
// 	try {
// 		const analyticsData = await getAnalyticsData();

// 		const endDate = new Date();
// 		const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

// 		const dailySalesData = await getDailySalesData(startDate, endDate);

// 		res.json({
// 			analyticsData,
// 			dailySalesData,
// 		});
// 	} catch (error) {
// 		console.log("Error in analytics route", (error as Error).message);
// 		res.status(500).json({ message: "Server error", error: (error as Error).message });
// 	}
// });

export default router;
