import { Response, NextFunction } from 'express';
import Moodboard, { IMoodboard } from '../models/Moodboard';
import Credit from '../models/Credit';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

interface CreateMoodboardRequest extends AuthRequest {
  body: {
    moodName: string;
    description: string;
    customText: string;
    theme: string;
  };
}

interface UpdateMoodboardRequest extends AuthRequest {
  body: {
    moodName?: string;
    description?: string;
    customText?: string;
    theme?: string;
    isActive?: boolean;
  };
}

// @desc    Get all moodboards for user
// @route   GET /api/moodboards
// @access  Private
export const getMoodboards = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const moodboards = await Moodboard.find({ userId: req.user!._id })
    .sort({ createdAt: -1 });

  console.log('🎨 Found moodboards for user:', req.user!._id, '- Count:', moodboards.length);
  console.log('🎨 Moodboards details:', moodboards.map(m => ({
    id: m._id,
    name: m.moodName,
    isActive: m.isActive,
    isDefault: m.isDefault
  })));

  res.status(200).json({
    success: true,
    count: moodboards.length,
    data: moodboards,
  });
});

// @desc    Get single moodboard
// @route   GET /api/moodboards/:id
// @access  Private
export const getMoodboard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const moodboard = await Moodboard.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!moodboard) {
    return next(new AppError('Moodboard not found 💔', 404));
  }

  res.status(200).json({
    success: true,
    data: moodboard,
  });
});

// @desc    Create new moodboard
// @route   POST /api/moodboards
// @access  Private
export const createMoodboard = asyncHandler(async (req: CreateMoodboardRequest, res: Response, next: NextFunction) => {
  const { moodName, description, customText, theme } = req.body;

  // Check how many custom moodboards user already has (excluding default ones)
  const customMoodboardCount = await Moodboard.countDocuments({
    userId: req.user!._id,
    isDefault: { $ne: true }
  });

  // Limit to 5 custom moodboards (plus the 5 default ones)
  if (customMoodboardCount >= 5) {
    return next(new AppError('You can only create up to 5 custom moodboards. Please delete one first to create a new one. 🎨', 400));
  }

  // Create moodboard (no credit charge)
  // First deactivate all existing moodboards for this user
  await Moodboard.updateMany(
    { userId: req.user!._id },
    { isActive: false }
  );

  const moodboard = await Moodboard.create({
    userId: req.user!._id,
    moodName,
    description,
    customText,
    theme,
    isActive: true, // This will be the only active one now
    isDefault: false, // Custom moodboards are not default
  });

  res.status(201).json({
    success: true,
    message: `Moodboard created successfully! 🎨💕`,
    data: moodboard,
  });
});

// @desc    Update moodboard
// @route   PUT /api/moodboards/:id
// @access  Private
export const updateMoodboard = asyncHandler(async (req: UpdateMoodboardRequest, res: Response, next: NextFunction) => {
  let moodboard = await Moodboard.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!moodboard) {
    return next(new AppError('Moodboard not found 💔', 404));
  }

  moodboard = await Moodboard.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Moodboard updated successfully! 💕',
    data: moodboard,
  });
});

// @desc    Delete moodboard
// @route   DELETE /api/moodboards/:id
// @access  Private
export const deleteMoodboard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const moodboard = await Moodboard.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!moodboard) {
    return next(new AppError('Moodboard not found 💔', 404));
  }

  await moodboard.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Moodboard deleted successfully! 🗑️',
  });
});

// @desc    Upload media to moodboard
// @route   POST /api/moodboards/:id/upload
// @access  Private
export const uploadMoodboardMedia = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const moodboard = await Moodboard.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!moodboard) {
    return next(new AppError('Moodboard not found 💔', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload a file 📁', 400));
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'muffi-link/moodboards',
      resource_type: 'auto', // Handles both images and videos
    });

    // Update moodboard with media URL
    if (result.resource_type === 'video') {
      moodboard.videoUrl = result.secure_url;
    } else {
      moodboard.imageUrl = result.secure_url;
    }

    await moodboard.save();

    res.status(200).json({
      success: true,
      message: 'Media uploaded successfully! 📸',
      data: {
        moodboard,
        mediaUrl: result.secure_url,
        mediaType: result.resource_type,
      },
    });
  } catch (error) {
    return next(new AppError('Error uploading media 💔', 500));
  }
});

// @desc    Get mood suggestions
// @route   GET /api/moodboards/suggestions
// @access  Private
export const getMoodSuggestions = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const moodSuggestions = [
    {
      id: 'romantic',
      name: 'Romantic',
      emoji: '💕',
      color: '#FF6B9D',
      description: 'Perfect for date nights and intimate moments',
      themes: ['candlelight', 'roses', 'sunset', 'heart']
    },
    {
      id: 'playful',
      name: 'Playful',
      emoji: '🎈',
      color: '#F8B500',
      description: 'Fun and energetic vibes for adventure',
      themes: ['bright', 'colorful', 'energetic', 'fun']
    },
    {
      id: 'cozy',
      name: 'Cozy',
      emoji: '🧸',
      color: '#C44569',
      description: 'Warm and comfortable atmosphere',
      themes: ['warm', 'soft', 'comfortable', 'intimate']
    },
    {
      id: 'dreamy',
      name: 'Dreamy',
      emoji: '✨',
      color: '#E3C6E3',
      description: 'Magical and ethereal feelings',
      themes: ['magical', 'dreamy', 'ethereal', 'fantasy']
    },
    {
      id: 'passionate',
      name: 'Passionate',
      emoji: '🔥',
      color: '#FF4757',
      description: 'Intense and fiery emotions',
      themes: ['intense', 'bold', 'passionate', 'dramatic']
    },
    {
      id: 'peaceful',
      name: 'Peaceful',
      emoji: '🌸',
      color: '#A8E6CF',
      description: 'Calm and serene moments together',
      themes: ['calm', 'peaceful', 'serene', 'nature']
    }
  ];

  res.status(200).json({
    success: true,
    data: moodSuggestions,
  });
});

// @desc    Select/Activate a mood for the user
// @route   PUT /api/moodboards/:id/select
// @access  Private
export const selectMood = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const moodboard = await Moodboard.findOne({
    _id: req.params.id,
    userId: req.user!._id,
  });

  if (!moodboard) {
    return next(new AppError('Moodboard not found 💔', 404));
  }

  // Deactivate all other moods for this user
  await Moodboard.updateMany(
    { userId: req.user!._id },
    { isActive: false }
  );

  // Activate the selected mood
  moodboard.isActive = true;
  await moodboard.save();

  res.status(200).json({
    success: true,
    message: `${moodboard.moodName} mood selected! Your partner will see this 💕`,
    data: moodboard,
  });
});

// @desc    Initialize default moodboards for user (if they don't have any)
// @route   POST /api/moodboards/initialize
// @access  Private
export const initializeDefaultMoodboards = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;
  
  // Check if user already has moodboards
  const existingCount = await Moodboard.countDocuments({ userId });
  
  if (existingCount > 0) {
    return res.status(200).json({
      success: true,
      message: `You already have ${existingCount} moodboards! 🎨`,
      data: { count: existingCount }
    });
  }

  // Create default moodboards
  const defaultMoodboards = [
    {
      userId,
      moodName: 'Romantic',
      description: 'Perfect for romantic evenings and intimate moments',
      theme: 'romantic',
      customText: 'Love is in the air ❤️',
      isActive: true, // Only this one should be active initially
      isDefault: true,
      backgroundColor: '#ff69b4',
      textColor: '#ffffff',
      emoji: '💕'
    },
    {
      userId,
      moodName: 'Playful',
      description: 'Fun and energetic activities together',
      theme: 'playful',
      customText: 'Let\'s have some fun! 🎉',
      isActive: false, // All others should be inactive
      isDefault: true,
      backgroundColor: '#ffa500',
      textColor: '#ffffff',
      emoji: '😄'
    },
    {
      userId,
      moodName: 'Calm',
      description: 'Peaceful and serene moments together',
      theme: 'calm',
      customText: 'Finding peace in each other 🕊️',
      isActive: false, // All others should be inactive
      isDefault: true,
      backgroundColor: '#87ceeb',
      textColor: '#ffffff',
      emoji: '🌅'
    }
  ];

  const createdMoodboards = await Moodboard.insertMany(defaultMoodboards);

  return res.status(201).json({
    success: true,
    message: `Created ${createdMoodboards.length} default moodboards! 🎨💕`,
    data: createdMoodboards
  });
});

// @desc    Fix moodboard active states (only one should be active per user)
// @route   POST /api/moodboards/fix-active-states
// @access  Private
export const fixMoodboardActiveStates = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!._id;
  
  // Get all moodboards for this user
  const userMoodboards = await Moodboard.find({ userId }).sort({ createdAt: 1 });
  
  if (userMoodboards.length === 0) {
    return res.status(200).json({
      success: true,
      message: 'No moodboards found to fix! 🎨',
      data: { fixed: 0 }
    });
  }

  // Find all active moodboards
  const activeMoodboards = userMoodboards.filter(m => m.isActive);
  
  if (activeMoodboards.length <= 1) {
    return res.status(200).json({
      success: true,
      message: `Moodboard states are already correct! Active: ${activeMoodboards.length} 🎨`,
      data: { fixed: 0, active: activeMoodboards.length }
    });
  }

  // Deactivate all moodboards first
  await Moodboard.updateMany(
    { userId },
    { isActive: false }
  );

  // Activate the first one (or the first default one if available)
  const firstDefault = userMoodboards.find(m => m.isDefault);
  const moodboardToActivate = firstDefault || userMoodboards[0];
  
  moodboardToActivate.isActive = true;
  await moodboardToActivate.save();

  console.log(`🔧 Fixed moodboard active states for user ${userId}. Activated: ${moodboardToActivate.moodName}`);

  return res.status(200).json({
    success: true,
    message: `Fixed moodboard active states! Now only "${moodboardToActivate.moodName}" is active. 🔧💕`,
    data: { 
      fixed: activeMoodboards.length - 1,
      activeMoodboard: moodboardToActivate.moodName
    }
  });
});
