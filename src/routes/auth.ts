import express from "express";
import { login, logout, register, refreshToken, getProfile, uploadAvatarController, changePassword } from "../controllers/auth.controller";
import { protectRoute } from "../middleware/auth.mw";
// import { updateProfile } from './controllers/user.controller';
import { uploadAvatar } from "../middleware/upload.mw";
import multer from "multer";


const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.post("/auth/refresh-token", refreshToken);
router.get("/auth/profile", protectRoute, getProfile);
router.post('/auth/change-password' , protectRoute, changePassword);
// Uncomment the following line if you have an updateProfile controller
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
