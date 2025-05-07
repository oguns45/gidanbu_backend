// import { NextFunction, Response } from "express";
// import jwt from "jsonwebtoken";
// import User from "../models/User.model";
// import { CustomRequest } from "../utils/interface.util";

// export const protectRoute = async (req: CustomRequest, res: Response, next: NextFunction): Promise<void> => {
//     try {
//         const accessToken = req.cookies.accessToken;

//         if (!accessToken) {
//             res.status(401).json({ message: "Unauthorized - No access token provided" });
//             return;
//         }

//         try {
//             const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as { id: string };
//             const user = await User.findById(decoded.id).select("-password"); // Exclude password field

//             if (!user) {
//                 res.status(401).json({ message: "Unauthorized - User not found" });
//                 return;
//             }

//             req.user = user;
//             next();
//         } catch (error: any) {
//             if (error.name === "TokenExpiredError") {
//                 res.status(401).json({ message: "Unauthorized - Access token expired" });
//                 return;
//             }
//             throw error;
//         }
//     } catch (error: any) {
//         console.error("Error in protectRoute middleware:", error.message);
//         res.status(401).json({ message: "Unauthorized - Invalid access token" });
//     }
// };

// export const adminRoute = (req: CustomRequest, res: Response, next: NextFunction): void => {
//     if (req.user && req.user.role === "admin") {
//         next();
//     } else {
//         res.status(403).json({ message: "Access denied - Admin only" });
//     }
// };





import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User.model";
import { ObjectId } from "mongoose"; // Correctly import ObjectId from Mongoose

// Extend the Express Request interface to include the `user` property
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: string | ObjectId;  // Change _id to accept both string and ObjectId
        role: string;
        [key: string]: any;
      };
    }
  }
}

export const protectRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    //const accessToken = req.cookies.accessToken;
    const authorization_header = req.headers.authorization; // Use the Authorization header instead of cookies
    if (!authorization_header) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    console.log("Authorization Header:", authorization_header);

    const accessToken_ = authorization_header.split(" ");
    const accessToken = accessToken_[1]

    

    console.log("for mw", accessToken);

    if (!accessToken) {
      res.status(401).json({ message: "Unauthorized - No access token provided" });
      return;
    }

    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string) as JwtPayload;
      console.log(decoded);
      const user = await User.findById(decoded.userId);
      

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      req.user = user.toObject();
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        res.status(401).json({ message: "Unauthorized - Access token expired" });
        return;
      }
      throw error;
    }
  } catch (error: any) {
    console.error("Error in protectRoute middleware:", error.message);
    res.status(401).json({ message: "Unauthorized - Invalid access token" });
  }
};

export const adminRoute = (req: Request, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied - Admin only" });
  }
};