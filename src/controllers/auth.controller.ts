// import { Request, Response, NextFunction } from 'express'
// import asyncHandler from "../middleware/async.mw";
// import logger from '../utils/logger.utils';
// import { RegisterDTO } from '../dtos/auth.dto';
// import Role from '../models/Role.model';
// import { AppChannel, UserType } from '../utils/enums.utils';
// import ErrorResponse from '../utils/error.utils';
// import User from '../models/User.model';
// import UserService from '../services/user.service';
// import AuthService from '../services/auth.service'
// import AuthMapper from '../mappers/auth.mapper';

// /**
//  * @name register
//  * @description Registers a new user for the application
//  * @route POST /auth/register
//  * @access everyone
//  */

// export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    
//     const { email, password } = req.body as RegisterDTO;

//     const validate = await AuthService.validateRegister(req.body)
   
//     if (validate.error) {
//         return next(new ErrorResponse('Error', validate.code!, [validate.message]))
//     }
   
//     //validate existing email
//     const existUser = await User.findOne({email: email});

//     if (existUser) {
//         return next(new ErrorResponse('Error', 403, ["user already exists, use another email"]))
//     }
//     //create the user
//     const user = await UserService.createUser({
//         email: email,
//         password: password,
//         userType: UserType.BUSINESS
//     });

//     //map data
//     const mapped = await AuthMapper.mapRegisteredUser(user)

//     res.status(200).json({
//         error: false,
//         errors: [],
//         data: mapped,
//         message: 'successful',
//         status: 200
//     })
// })


import { Request, Response, NextFunction } from 'express';
import asyncHandler from "../middleware/async.mw";
import logger from '../utils/logger.utils';
import { RegisterDTO, LoginDTO, ForgotPasswordDTO, ResetPasswordDTO } from '../dtos/auth.dto';
import { UserType } from '../utils/enums.utils';
import ErrorResponse from '../utils/error.utils';
import User from '../models/User.model';
import UserService from '../services/user.service';
import AuthService from '../services/auth.service';
import AuthMapper from '../mappers/auth.mapper';
import { redis } from "../config/redis";
import storeRefreshToken  from '../middleware/redis.mw';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import sendwelcomeEmail from '../config/mailgun';
import { IUserDoc } from "../utils/interface.util";
import Role from '../models/Role.model';
import crypto from 'crypto'; // For generating password reset tokens
import { Types } from 'mongoose';

type DecodedToken = {
  userId: string;
  iat?: number;
  exp?: number;
};

interface AuthenticatedRequest extends Request {
  user?: IUserDoc;
}

// Utility function to set cookies with tokens
const setCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    // maxAge: 15 * 60 * 1000, // 15 minutes
    maxAge: 24 * 60 * 60 * 1000, // 1 days
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

/**
 * @name register
 * @description Registers a new user for the application
 * @route POST /auth/register
 * @access everyone
 */
export const register = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password, username, firstName, lastName } = req.body as RegisterDTO;
  const validate = await AuthService.validateRegister(req.body);

  if (validate.error) {
    return next(new ErrorResponse('Error', validate.code!, [validate.message]));
  }

  const existUser = await User.findOne({ email: email });

  if (existUser) {
    return next(new ErrorResponse('Error', 403, ["User already exists, use another email"]));
  }

  const user = await UserService.createUser({
    email,
    password,
    username,
    firstName,
    lastName,
    userType: UserType.BUSINESS,
  });

  const mapped = await AuthMapper.mapRegisteredUser(user);
  const userId: string = (user._id as Types.ObjectId).toString();
  const { accessToken, refreshToken } = await user.generateTokens(userId);
  await storeRefreshToken(user._id.toString(), refreshToken);

  setCookies(res, accessToken, refreshToken);

  res.status(201).json({
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
    message: "User created successfully",
  });

  // Send welcome email
  const message = `Welcome to Utter Utility! \nClick below to verify your email: http://localhost:3000/verify?token=${accessToken}\nYour username is ${username}`;
  const subject = "Welcome on board!";
  sendwelcomeEmail({ email: user.email, subject, message }, accessToken, username, user.role);
});

/**
 * @name login
 * @description Logs in a user
 * @route POST /auth/login
 * @access everyone
 */
export const login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body as LoginDTO;

  const validate = await AuthService.validateLogin(req.body);
  if (validate.error) {
    return next(new ErrorResponse("Error", validate.code!, [validate.message]));
  }

  const user = await User.findOne({ email: email }).select("+password") as IUserDoc;

  if (!user) {
    return next(new ErrorResponse("Error", 403, ["User does not exist, check your email or username"]));
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const userId: string = (user._id as Types.ObjectId).toString();
  const { accessToken, refreshToken } = await user.generateTokens(userId);
  await storeRefreshToken(user._id.toString(), refreshToken);

  setCookies(res, accessToken, refreshToken);

  res.json({
    _id: user._id,
    name: user.username,
    email: user.email,
    role: user.role,
    data: accessToken,
  });
});

/**
 * @name logout
 * @description Logs out a user
 * @route POST /auth/logout
 * @access authenticated users
 */
export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new ErrorResponse("Error", 400, ["No refresh token provided"]));
  }

  if (refreshToken.split('.').length !== 3) {
    res.clearCookie("refreshToken");
    return next(new ErrorResponse("Error", 400, ["Malformed refresh token"]));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as { userId: string };
    await redis.del(`refresh_token:${decoded.userId}`);
  } catch (err: any) {
    if (err instanceof jwt.JsonWebTokenError) {
      res.clearCookie("refreshToken");
      return next(new ErrorResponse("Error", 400, ["Invalid or malformed token"]));
    }
    if (err instanceof jwt.TokenExpiredError) {
      res.clearCookie("refreshToken");
      return next(new ErrorResponse("Error", 401, ["Token expired"]));
    }
    throw err;
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
});

/**
 * @name refreshToken
 * @description Refreshes the access token
 * @route POST /auth/refresh-token
 * @access authenticated users
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return next(new ErrorResponse("Error", 401, ["No refresh token provided"]));
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as DecodedToken;
  const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

  if (storedToken !== refreshToken) {
    return next(new ErrorResponse("Error", 401, ["Invalid refresh token"]));
  }

  const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "15m",
  });

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.json({ message: "Token refreshed successfully" });
});

/**
 * @name getProfile
 * @description Gets the user's profile
 * @route GET /auth/profile
 * @access authenticated users
 */
export const getProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ErrorResponse("Error", 401, ["User not authenticated"]));
  }

  res.json(req.user);
});

/**
 * @name forgotPassword
 * @description Sends a password reset email to the user
 * @route POST /auth/forgot-password
 * @access everyone
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body as ForgotPasswordDTO;

  const user = await User.findOne({ email }) as IUserDoc;
  if (!user) {
    return next(new ErrorResponse("Error", 404, ["User not found"]));
  }

  // Generate a password reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
  await user.save();

  // Send the reset token via email
  const resetUrl = `http://localhost:3000/reset-password?token=${resetToken}`;
  const message = `You are receiving this email because you (or someone else) requested a password reset. Please click the link below to reset your password:\n\n${resetUrl}`;
  const subject = "Password Reset Request";

  sendwelcomeEmail({ email: user.email, subject, message }, resetToken, user.username, user.role);

  res.status(200).json({ message: "Password reset email sent" });
});

/**
 * @name resetPassword
 * @description Resets the user's password
 * @route POST /auth/reset-password
 * @access everyone
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const { token, newPassword } = req.body as ResetPasswordDTO;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  }) as IUserDoc;

  if (!user) {
    return next(new ErrorResponse("Error", 400, ["Invalid or expired token"]));
  }

  // Hash the new password and save it
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password reset successful" });
});