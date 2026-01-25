import express from "express";
import { login, logout, register, refreshToken, getProfile, uploadAvatarController, changePassword, getAllUsers, updateOnlineStatus, loginAdmin } from "../controllers/auth.controller";
import {adminRoute, protectRoute } from "../middleware/auth.mw";
// import { updateProfile } from './controllers/user.controller';
import { uploadAvatar } from "../middleware/upload.mw";
import multer from "multer";


const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.post("/auth/admin/login", loginAdmin);
router.post("/auth/admin/logout", logout);
router.post("/auth/refresh-token", refreshToken);
router.get("/auth/profile", protectRoute, getProfile);
router.post('/auth/change-password' , protectRoute, changePassword);

// routes/userRoutes.ts
router.get("/auth/", protectRoute, getAllUsers);
router.patch("/auth/:id/online", protectRoute, updateOnlineStatus);

// Uncomment the following line if you have an updateProfile controllers
// router.patch('/profile', uploadAvatar.single('avatar'),updateProfile);

router.post(
    "/auth/upload-avatar",
    protectRoute,
    (req, res, next) => {
      uploadAvatar.single("avatar")(req, res, function(err) {
        if (err instanceof multer.MulterError) {
          // A Multer error occurred when uploading
          return res.status(400).json({
            error: true,
            message: "File upload error",
            details: err.message
          });
        } else if (err) {
          // An unknown error occurred
          return next(err);
        }
        // Everything went fine
        next();
      });
    },
    uploadAvatarController
  );

export default router;
