import { Response, NextFunction } from 'express';
import Service, { IService } from '../models/Service';
import Moodboard from '../models/Moodboard';
import Credit from '../models/Credit';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

interface CreateServiceRequest extends AuthRequest {
  body: {
    name: string;
    description: string;
    date: string;
    time: string;
    moodboardId?: string;
    creditCost: number;
    category: 'date' | 'gift' | 'activity' | 'surprise' | 'help' | 'custom';
    location?: string;
    notes?: string;
  };
}

interface BookServiceRequest extends AuthRequest {
  body: {
    date: string;
    time: string;
    moodboardId?: string;
    location?: string;
    notes?: string;
  };
}

// @desc    Get all services
// @route   GET /api/services
// @access  Private
export const getServices = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const services = await Service.find()
    .populate('user', 'name email role')
    .populate('partner', 'name email role')
    .populate('moodboard', 'moodName theme imageUrl')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: services.length,
    data: services,
  });
});

// @desc    Get user's bookings
// @route   GET /api/services/bookings
// @access  Private
export const getBookings = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const bookings = await Service.find({ 
    $or: [
      { userId: req.user!._id },
      { partnerId: req.user!._id }
    ]
  })
    .populate('user', 'name email role')
    .populate('partner', 'name email role')
    .populate('moodboard', 'moodName theme imageUrl')
    .sort({ date: 1 });

  res.status(200).json({
    success: true,
    count: bookings.length,
    data: bookings,
  });
});

// @desc    Create a new service
// @route   POST /api/services
// @access  Private (Admin/Service Provider)
export const createService = asyncHandler(async (req: CreateServiceRequest, res: Response, next: NextFunction) => {
  const {
    name,
    description,
    creditCost,
    category,
    location,
    notes
  } = req.body;

  const service = await Service.create({
    name,
    description,
    date: new Date(), // Default date, will be updated when booked
    time: '00:00', // Default time, will be updated when booked
    userId: req.user!._id,
    partnerId: req.user!.partnerId || req.user!._id, // Default to self if no partner
    creditCost,
    category,
    location,
    notes,
    isCustom: true,
    status: 'pending'
  });

  await service.populate('user', 'name email role');
  await service.populate('partner', 'name email role');

  res.status(201).json({
    success: true,
    message: 'Service created successfully! 💕',
    data: service,
  });
});

// @desc    Book a service
// @route   POST /api/services/:id/book
// @access  Private
export const bookService = asyncHandler(async (req: BookServiceRequest, res: Response, next: NextFunction) => {
  const { date, time, moodboardId, location, notes } = req.body;

  // Find the service
  const service = await Service.findById(req.params.id);
  if (!service) {
    return next(new AppError('Service not found 💔', 404));
  }

  // Check if user has enough credits
  const userBalance = await Credit.getUserBalance(req.user!._id);
  if (userBalance < service.creditCost) {
    return next(new AppError('Insufficient credits to book this service 💎', 400));
  }

  // Validate moodboard if provided
  let selectedMoodboard = null;
  if (moodboardId) {
    selectedMoodboard = await Moodboard.findOne({
      _id: moodboardId,
      userId: req.user!._id
    });
    
    if (!selectedMoodboard) {
      return next(new AppError('Invalid moodboard selection 🎨', 400));
    }
  }

  // Deduct credits
  await Credit.createTransaction({
    userId: req.user!._id,
    amount: service.creditCost,
    type: 'spent',
    reason: `Service booking: ${service.name}`,
    relatedId: service._id.toString(),
    relatedType: 'service',
    metadata: {
      serviceId: service._id,
      serviceName: service.name,
      moodboardId: moodboardId || null,
      moodboardName: selectedMoodboard?.moodName || null
    }
  });

  // Update service with booking details
  service.date = new Date(date);
  service.time = time;
  service.partnerId = req.user!._id;
  service.moodboardId = moodboardId || undefined;
  service.location = location || service.location;
  service.notes = notes || service.notes;
  service.status = 'confirmed';

  await service.save();

  // Populate the service with related data
  await service.populate('user', 'name email role');
  await service.populate('partner', 'name email role');
  await service.populate('moodboard', 'moodName theme imageUrl');

  res.status(200).json({
    success: true,
    message: `Service booked successfully! ${selectedMoodboard ? `Mood: ${selectedMoodboard.moodName} 🎨` : ''} 💕`,
    data: service,
  });
});

// @desc    Update service status
// @route   PUT /api/services/:id/status
// @access  Private
export const updateServiceStatus = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { status, rating, feedback } = req.body;

  const service = await Service.findById(req.params.id);
  if (!service) {
    return next(new AppError('Service not found 💔', 404));
  }

  // Check if user is authorized to update this service
  if (service.userId !== req.user!._id && service.partnerId !== req.user!._id) {
    return next(new AppError('Not authorized to update this service 🔒', 403));
  }

  service.status = status;
  if (rating) service.rating = rating;
  if (feedback) service.feedback = feedback;

  await service.save();

  await service.populate('user', 'name email role');
  await service.populate('partner', 'name email role');
  await service.populate('moodboard', 'moodName theme imageUrl');

  res.status(200).json({
    success: true,
    message: 'Service updated successfully! 💕',
    data: service,
  });
});

// @desc    Get service by ID
// @route   GET /api/services/:id
// @access  Private
export const getService = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const service = await Service.findById(req.params.id)
    .populate('user', 'name email role')
    .populate('partner', 'name email role')
    .populate('moodboard', 'moodName theme imageUrl');

  if (!service) {
    return next(new AppError('Service not found 💔', 404));
  }

  res.status(200).json({
    success: true,
    data: service,
  });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
export const deleteService = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new AppError('Service not found 💔', 404));
  }

  // Check if user is authorized to delete this service
  if (service.userId !== req.user!._id) {
    return next(new AppError('Not authorized to delete this service 🔒', 403));
  }

  await service.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Service deleted successfully! 💕',
  });
});
