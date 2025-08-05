import { Response, NextFunction } from 'express';
import Memory from '../models/Memory';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

interface CreateMemoryRequest extends AuthRequest {
  body: {
    receiverId: string;
    title: string;
    description: string;
    memoryDate: Date;
    imageUrl?: string;
    videoUrl?: string;
    location?: string;
    moodboardId?: string;
    tags?: string[];
  };
}

interface UpdateMemoryRequest extends AuthRequest {
  body: {
    title?: string;
    description?: string;
    memoryDate?: Date;
    imageUrl?: string;
    videoUrl?: string;
    location?: string;
    moodboardId?: string;
    isRead?: boolean;
    isFavorite?: boolean;
    tags?: string[];
  };
}

// @desc    Share a memory
// @route   POST /api/memories
// @access  Private
export const shareMemory = asyncHandler(async (req: CreateMemoryRequest, res: Response, next: NextFunction) => {
  const { 
    receiverId, 
    title, 
    description, 
    memoryDate, 
    imageUrl, 
    videoUrl, 
    location, 
    moodboardId, 
    tags 
  } = req.body;

  // Check if receiver exists and is the partner
  if (receiverId !== req.user!.partnerId) {
    return next(new AppError('You can only share memories with your partner 💔', 400));
  }

  const memory = await Memory.create({
    senderId: req.user!._id,
    receiverId,
    title,
    description,
    memoryDate,
    imageUrl,
    videoUrl,
    location,
    moodboardId,
    tags: tags || []
  });

  await memory.populate('sender', 'firstName lastName email avatar');
  await memory.populate('receiver', 'firstName lastName email avatar');
  await memory.populate('moodboard', 'moodName theme imageUrl');

  res.status(201).json({
    success: true,
    message: 'Memory shared successfully! 💕',
    data: memory,
  });
});

// @desc    Get received memories
// @route   GET /api/memories/received
// @access  Private
export const getReceivedMemories = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const memories = await Memory.find({ receiverId: req.user!._id })
    .populate('sender', 'firstName lastName email avatar')
    .populate('moodboard', 'moodName theme imageUrl')
    .sort({ memoryDate: -1 });

  res.status(200).json({
    success: true,
    count: memories.length,
    data: memories,
  });
});

// @desc    Get shared memories
// @route   GET /api/memories/shared
// @access  Private
export const getSharedMemories = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const memories = await Memory.find({ senderId: req.user!._id })
    .populate('receiver', 'firstName lastName email avatar')
    .populate('moodboard', 'moodName theme imageUrl')
    .sort({ memoryDate: -1 });

  res.status(200).json({
    success: true,
    count: memories.length,
    data: memories,
  });
});

// @desc    Get single memory
// @route   GET /api/memories/:id
// @access  Private
export const getMemory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const memory = await Memory.findOne({
    _id: req.params.id,
    $or: [
      { senderId: req.user!._id },
      { receiverId: req.user!._id }
    ]
  })
    .populate('sender', 'firstName lastName email avatar')
    .populate('receiver', 'firstName lastName email avatar')
    .populate('moodboard', 'moodName theme imageUrl');

  if (!memory) {
    return next(new AppError('Memory not found 💔', 404));
  }

  // Mark as read if receiver is viewing
  if (memory.receiverId === req.user!._id && !memory.isRead) {
    memory.isRead = true;
    await memory.save();
  }

  res.status(200).json({
    success: true,
    data: memory,
  });
});

// @desc    Update memory (mark as read, favorite, etc.)
// @route   PUT /api/memories/:id
// @access  Private
export const updateMemory = asyncHandler(async (req: UpdateMemoryRequest, res: Response, next: NextFunction) => {
  const memory = await Memory.findOne({
    _id: req.params.id,
    receiverId: req.user!._id // Only receiver can update
  });

  if (!memory) {
    return next(new AppError('Memory not found or you cannot modify it 💔', 404));
  }

  const updatedMemory = await Memory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
    .populate('sender', 'firstName lastName email avatar')
    .populate('receiver', 'firstName lastName email avatar')
    .populate('moodboard', 'moodName theme imageUrl');

  res.status(200).json({
    success: true,
    message: 'Memory updated successfully! 💕',
    data: updatedMemory,
  });
});

// @desc    Delete memory
// @route   DELETE /api/memories/:id
// @access  Private
export const deleteMemory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const memory = await Memory.findOne({
    _id: req.params.id,
    senderId: req.user!._id // Only sender can delete
  });

  if (!memory) {
    return next(new AppError('Memory not found or you cannot delete it 💔', 404));
  }

  await Memory.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Memory deleted successfully! 💕',
  });
});

// @desc    Get unread memories count
// @route   GET /api/memories/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const count = await Memory.countDocuments({
    receiverId: req.user!._id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    count,
  });
});

// @desc    Get memories by tags
// @route   GET /api/memories/tags/:tag
// @access  Private
export const getMemoriesByTag = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const memories = await Memory.find({
    $or: [
      { senderId: req.user!._id },
      { receiverId: req.user!._id }
    ],
    tags: req.params.tag
  })
    .populate('sender', 'firstName lastName email avatar')
    .populate('receiver', 'firstName lastName email avatar')
    .populate('moodboard', 'moodName theme imageUrl')
    .sort({ memoryDate: -1 });

  res.status(200).json({
    success: true,
    count: memories.length,
    data: memories,
  });
}); 