import { Response, NextFunction } from 'express';
import LoveNote from '../models/LoveNote';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

interface CreateLoveNoteRequest extends AuthRequest {
  body: {
    receiverId: string;
    title: string;
    content: string;
    moodboardId?: string;
    expiresAt?: Date;
  };
}

interface UpdateLoveNoteRequest extends AuthRequest {
  body: {
    title?: string;
    content?: string;
    moodboardId?: string;
    isRead?: boolean;
    isFavorite?: boolean;
    expiresAt?: Date;
  };
}

// @desc    Send a love note
// @route   POST /api/love-notes
// @access  Private
export const sendLoveNote = asyncHandler(async (req: CreateLoveNoteRequest, res: Response, next: NextFunction) => {
  const { receiverId, title, content, moodboardId, expiresAt } = req.body;

  // Check if receiver exists and is the partner
  if (receiverId !== req.user!.partnerId) {
    return next(new AppError('You can only send love notes to your partner 💔', 400));
  }

  const loveNote = await LoveNote.create({
    senderId: req.user!._id,
    receiverId,
    title,
    content,
    moodboardId,
    expiresAt
  });

  await loveNote.populate('sender', 'firstName lastName email avatar');
  await loveNote.populate('receiver', 'firstName lastName email avatar');
  await loveNote.populate('moodboard', 'moodName theme imageUrl');

  res.status(201).json({
    success: true,
    message: 'Love note sent successfully! 💕',
    data: loveNote,
  });
});

// @desc    Get received love notes
// @route   GET /api/love-notes/received
// @access  Private
export const getReceivedLoveNotes = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const loveNotes = await LoveNote.find({ receiverId: req.user!._id })
    .populate('sender', 'firstName lastName email avatar')
    .populate('moodboard', 'moodName theme imageUrl')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: loveNotes.length,
    data: loveNotes,
  });
});

// @desc    Get sent love notes
// @route   GET /api/love-notes/sent
// @access  Private
export const getSentLoveNotes = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const loveNotes = await LoveNote.find({ senderId: req.user!._id })
    .populate('receiver', 'firstName lastName email avatar')
    .populate('moodboard', 'moodName theme imageUrl')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: loveNotes.length,
    data: loveNotes,
  });
});

// @desc    Get single love note
// @route   GET /api/love-notes/:id
// @access  Private
export const getLoveNote = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const loveNote = await LoveNote.findOne({
    _id: req.params.id,
    $or: [
      { senderId: req.user!._id },
      { receiverId: req.user!._id }
    ]
  })
    .populate('sender', 'firstName lastName email avatar')
    .populate('receiver', 'firstName lastName email avatar')
    .populate('moodboard', 'moodName theme imageUrl');

  if (!loveNote) {
    return next(new AppError('Love note not found 💔', 404));
  }

  // Mark as read if receiver is viewing
  if (loveNote.receiverId === req.user!._id && !loveNote.isRead) {
    loveNote.isRead = true;
    await loveNote.save();
  }

  res.status(200).json({
    success: true,
    data: loveNote,
  });
});

// @desc    Update love note (mark as read, favorite, etc.)
// @route   PUT /api/love-notes/:id
// @access  Private
export const updateLoveNote = asyncHandler(async (req: UpdateLoveNoteRequest, res: Response, next: NextFunction) => {
  const loveNote = await LoveNote.findOne({
    _id: req.params.id,
    receiverId: req.user!._id // Only receiver can update
  });

  if (!loveNote) {
    return next(new AppError('Love note not found or you cannot modify it 💔', 404));
  }

  const updatedLoveNote = await LoveNote.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  )
    .populate('sender', 'firstName lastName email avatar')
    .populate('receiver', 'firstName lastName email avatar')
    .populate('moodboard', 'moodName theme imageUrl');

  res.status(200).json({
    success: true,
    message: 'Love note updated successfully! 💕',
    data: updatedLoveNote,
  });
});

// @desc    Delete love note
// @route   DELETE /api/love-notes/:id
// @access  Private
export const deleteLoveNote = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const loveNote = await LoveNote.findOne({
    _id: req.params.id,
    senderId: req.user!._id // Only sender can delete
  });

  if (!loveNote) {
    return next(new AppError('Love note not found or you cannot delete it 💔', 404));
  }

  await LoveNote.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Love note deleted successfully! 💕',
  });
});

// @desc    Get unread love notes count
// @route   GET /api/love-notes/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const count = await LoveNote.countDocuments({
    receiverId: req.user!._id,
    isRead: false
  });

  res.status(200).json({
    success: true,
    count,
  });
}); 