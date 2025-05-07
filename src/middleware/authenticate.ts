import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model'; // Adjust the import path as needed
import { AuthenticatedRequest } from '../utils/cupoun_auth_type.utils'; // Adjust the import path as needed

const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('Authentication required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error('User not found');
    }

    req.user = user; // Attach the user object to the request
    next();
  } catch (error: any) {
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

export default authenticate;