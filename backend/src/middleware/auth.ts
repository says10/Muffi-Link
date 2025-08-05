import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { AppError, asyncHandler } from './errorHandler';

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: string;
  partnerId?: string;
  iat: number;
  exp: number;
}

// Protect routes - check if user is authenticated
export const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Check for token in headers
  if (req.get('authorization') && req.get('authorization')!.startsWith('Bearer')) {
    token = req.get('authorization')!.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new AppError('Not authorized to access this route 💔', 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Get user from token
    const user = await User.findById(decoded.id).select('-hashedAccessKey');
    
    if (!user) {
      return next(new AppError('No user found with this token 💔', 401));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    req.user = user;
    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route 💔', 401));
  }
});

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(`User role ${req.user?.role} is not authorized to access this route 💔`, 403));
    }
    next();
  };
};

// Check if users are partners
export const checkPartnership = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { partnerId } = req.params;
  
  if (!req.user) {
    return next(new AppError('User not authenticated 💔', 401));
  }

  // If partnerId is provided, check if they are actually partners
  if (partnerId && req.user.partnerId !== partnerId) {
    return next(new AppError('You can only interact with your partner 💔', 403));
  }

  next();
});

// Validate access key for couple linking
export const validateAccessKey = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { accessKey } = req.body;

  if (!accessKey) {
    return next(new AppError('Access key is required 🗝️', 400));
  }

  // Check if access key is already used by maximum 2 users
  const existingUsers = await User.find({});
  let matchingUsers = 0;

  for (const user of existingUsers) {
    if (await user.matchPassword(accessKey)) {
      matchingUsers++;
    }
  }

  if (matchingUsers >= 2) {
    return next(new AppError('This access key is already used by the maximum number of users (2) 💔', 400));
  }

  next();
});

// Rate limiting for sensitive operations
export const sensitiveOperationLimit = (maxAttempts: number, windowMs: number) => {
  const attempts = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const key = req.ip + (req.user?._id || '');
    const now = Date.now();
    const userAttempts = attempts.get(key);

    if (userAttempts) {
      if (now > userAttempts.resetTime) {
        // Reset window
        attempts.set(key, { count: 1, resetTime: now + windowMs });
      } else if (userAttempts.count >= maxAttempts) {
        return next(new AppError('Too many attempts. Please try again later 💔', 429));
      } else {
        userAttempts.count++;
      }
    } else {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
    }

    next();
  };
};
