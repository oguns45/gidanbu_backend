import express, { Request, Response } from "express";

const router = express.Router();

// ✅ Simple, fast ping endpoint for cron jobs or uptime checks
router.get("/ping", (req: Request, res: Response) => {
  res.status(200).json({
    message: "pong",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
