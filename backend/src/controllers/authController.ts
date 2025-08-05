import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
const crypto = require('crypto');
import User, { IUser } from '../models/User';
import Credit from '../models/Credit';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

interface SignupRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
    role: 'boyfriend' | 'girlfriend' | 'partner';
    accessKey: string;
    phone?: string;
    dateOfBirth?: Date;
    avatar?: string;
  };
}

interface SigninRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface LinkPartnerRequest extends AuthRequest {
  body: {
    accessKey: string;
  };
}

// Generate JWT token
const signToken = (user: IUser) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      partnerId: user.partnerId,
    } as any,
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    } as any
  );
};

// Send token response
const createSendToken = (user: IUser, statusCode: number, res: Response, message: string) => {
  const token = signToken(user);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_COOKIE_EXPIRE || '30') * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  const userWithoutPassword = user.toObject();
  delete userWithoutPassword.hashedAccessKey;

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: userWithoutPassword,
    },
  });
};

// @desc    Register user & get token
// @route   POST /api/auth/signup
// @access  Public
export const signup = asyncHandler(async (req: SignupRequest, res: Response, next: NextFunction) => {
  const { name, email, password, role, accessKey, phone, dateOfBirth, avatar } = req.body;

  // Split name into firstName and lastName
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists 💔', 400));
  }

  // Check if access key is already used by 2 users (linked)
  const usersWithSameKey = await User.find({ accessKey });
  if (usersWithSameKey.length >= 2) {
    return next(new AppError('This access key is already used by the maximum number of users (2) 💔', 400));
  }

  // Create the new user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    accessKey,
    role,
    phone,
    dateOfBirth,
    avatar,
  });

  // Try to link with an existing user with the same accessKey and no partner
  const partner = await User.findOne({ accessKey, partnerId: null, _id: { $ne: user._id } });
  if (partner) {
    user.partnerId = partner._id;
    partner.partnerId = user._id;
    await user.save();
    await partner.save();
  }

  // Give single user 20 credits
  console.log('🎁 Adding 20 credits to new single user:', user._id);
  await Credit.addCredits(user._id, 20, 'Welcome to Muffi-Link! 💕', undefined, 'bonus');

  createSendToken(user, 201, res, 'User registered successfully! Welcome to Muffi-Link 💕');
});

// @desc    Login user & get token
// @route   POST /api/auth/signin
// @access  Public
export const signin = asyncHandler(async (req: SigninRequest, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Invalid email or password 💔', 401));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, 'Logged in successfully! Welcome back 💕');
});

// @desc    Log user out
// @route   POST /api/auth/logout
// @access  Private
export const logout = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully! See you soon 💕',
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?._id).populate('partnerId', 'firstName lastName email avatar role');

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    phone: req.body.phone,
    dateOfBirth: req.body.dateOfBirth,
    avatar: req.body.avatar,
    bio: req.body.bio,
    anniversaryDate: req.body.anniversaryDate,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key as keyof typeof fieldsToUpdate] === undefined && delete fieldsToUpdate[key as keyof typeof fieldsToUpdate]
  );

  const user = await User.findByIdAndUpdate(req.user?._id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'User details updated successfully 💕',
    data: {
      user,
    },
  });
});

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user?._id).select('+password');

  // Check current password
  if (!(await user?.matchPassword(req.body.currentPassword))) {
    return next(new AppError('Current password is incorrect 💔', 401));
  }

  if (user) {
    user.password = req.body.newPassword;
    await user.save();

    createSendToken(user, 200, res, 'Password updated successfully 🔐');
  }
});

// @desc    Link with partner using access key
// @route   POST /api/auth/link-partner
// @access  Private
export const linkPartner = asyncHandler(async (req: LinkPartnerRequest, res: Response, next: NextFunction) => {
  const { accessKey } = req.body;
  const currentUser = req.user!;

  // Check if user already has a partner
  if (currentUser.partnerId) {
    return next(new AppError('You are already linked with a partner 💑', 400));
  }

  // Find a user with the same accessKey and no partner
  const partner = await User.findOne({ accessKey, partnerId: null, _id: { $ne: currentUser._id } });
  if (!partner) {
    return next(new AppError('No user found with this access key 💔', 404));
  }

  if (partner.partnerId) {
    return next(new AppError('This user is already linked with someone else 💔', 400));
  }

  // Link both users
  currentUser.partnerId = partner._id;
  partner.partnerId = currentUser._id;
  await currentUser.save();
  await partner.save();

  // Give both users linking bonus credits
  await Credit.addCredits(currentUser._id, 25, 'Partner linking bonus! 💕', undefined, 'bonus');
  await Credit.addCredits(partner._id, 25, 'Partner linking bonus! 💕', undefined, 'bonus');

  res.status(200).json({
    success: true,
    message: 'Successfully linked with your partner! 💑',
    data: {
      partner: {
        _id: partner._id,
        firstName: partner.firstName,
        lastName: partner.lastName,
        email: partner.email,
        avatar: partner.avatar,
        role: partner.role,
      },
    },
  });
});

// @desc    Unlink from partner
// @route   POST /api/auth/unlink-partner
// @access  Private
export const unlinkPartner = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = req.user!;

  if (!currentUser.partnerId) {
    return next(new AppError('You are not linked with any partner 💔', 400));
  }

  const partner = await User.findById(currentUser.partnerId);

  // Unlink both users
  currentUser.partnerId = undefined;
  currentUser.relationshipStartDate = undefined;
  await currentUser.save();

  if (partner) {
    partner.partnerId = undefined;
    partner.relationshipStartDate = undefined;
    await partner.save();
  }

  res.status(200).json({
    success: true,
    message: 'Successfully unlinked from your partner 💔',
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email 💔', 404));
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

  // In a real app, you would send this via email
  // For now, we'll just return it in the response
  res.status(200).json({
    success: true,
    message: 'Password reset token generated 🔐',
    resetToken, // Don't include this in production
    resetUrl,
  });
});

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid or expired token 💔', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  createSendToken(user, 200, res, 'Password reset successfully 🔐');
});
