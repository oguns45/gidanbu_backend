import express from "express";
import { login, logout, register, refreshToken, getProfile } from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth.mw";

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.post("/auth/refresh-token", refreshToken);
router.get("/auth/profile", protectRoute, getProfile);

export default router;
