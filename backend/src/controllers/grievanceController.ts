import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import Grievance from '../models/Grievance';
import User from '../models/User';
import Credit from '../models/Credit';

interface AuthRequest extends Request {
  user?: any;
}

// Create grievance
export const createGrievance = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { title, category, description, severity, isAnonymous, tags } = req.body;
  const userId = req.user!._id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  // Get user and partner info
  const user = await User.findById(userId);
  if (!user || !user.partnerId) {
    return next(new AppError('User not found or not linked to partner', 404));
  }

  // Create grievance
  const grievance = await Grievance.create({
    userId: userId,
    partnerId: user.partnerId,
    title,
    category,
    description,
    severity,
    isAnonymous: isAnonymous || false,
    tags: tags || [],
    rating: 3, // Default rating, will be updated by user
    status: 'pending'
  });

  res.status(201).json({
    success: true,
    data: grievance,
    message: 'Grievance submitted successfully'
  });
});

// Get user's grievances
export const getGrievances = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const grievances = await Grievance.find({ userId })
    .populate('partnerId', 'firstName lastName email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: grievances
  });
});

// Get single grievance
export const getGrievance = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { grievanceId } = req.params;
  const userId = req.user!._id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const grievance = await Grievance.findById(grievanceId)
    .populate('partnerId', 'firstName lastName email');

  if (!grievance) {
    return next(new AppError('Grievance not found', 404));
  }

  // Check if user owns this grievance
  if (grievance.userId.toString() !== userId.toString()) {
    return next(new AppError('Not authorized to view this grievance', 403));
  }

  res.status(200).json({
    success: true,
    data: grievance
  });
});

// Update grievance
export const updateGrievance = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { grievanceId } = req.params;
  const updates = req.body;
  const userId = req.user!._id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const grievance = await Grievance.findById(grievanceId);

  if (!grievance) {
    return next(new AppError('Grievance not found', 404));
  }

  // Check if user owns this grievance
  if (grievance.userId.toString() !== userId.toString()) {
    return next(new AppError('Not authorized to update this grievance', 403));
  }

  // Only allow updates to certain fields
  const allowedUpdates = ['title', 'description', 'category', 'severity', 'tags'];
  const filteredUpdates: any = {};
  
  allowedUpdates.forEach(field => {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  });

  const updatedGrievance = await Grievance.findByIdAndUpdate(
    grievanceId,
    filteredUpdates,
    { new: true, runValidators: true }
  ).populate('partnerId', 'firstName lastName email');

  res.status(200).json({
    success: true,
    data: updatedGrievance,
    message: 'Grievance updated successfully'
  });
});

// Delete grievance
export const deleteGrievance = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { grievanceId } = req.params;
  const userId = req.user!._id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const grievance = await Grievance.findById(grievanceId);

  if (!grievance) {
    return next(new AppError('Grievance not found', 404));
  }

  // Check if user owns this grievance
  if (grievance.userId.toString() !== userId.toString()) {
    return next(new AppError('Not authorized to delete this grievance', 403));
  }

  // Only allow deletion if grievance is still pending
  if (grievance.status !== 'pending') {
    return next(new AppError('Can only delete pending grievances', 400));
  }

  await Grievance.findByIdAndDelete(grievanceId);

  res.status(200).json({
    success: true,
    message: 'Grievance deleted successfully'
  });
});

// Get grievance statistics
export const getGrievanceStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const stats = await Grievance.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalCreditImpact: { $sum: '$creditImpact' }
      }
    }
  ]);

  const totalGrievances = await Grievance.countDocuments({ userId });
  const totalCreditImpact = await Grievance.aggregate([
    { $match: { userId: userId } },
    { $group: { _id: null, total: { $sum: '$creditImpact' } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalGrievances,
      totalCreditImpact: totalCreditImpact[0]?.total || 0,
      byStatus: stats
    }
  });
}); 