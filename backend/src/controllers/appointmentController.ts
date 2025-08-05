import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Appointment, { IAppointment } from '../models/Appointment';
import Service from '../models/Service';
import Moodboard from '../models/Moodboard';
import User from '../models/User';
import Credit from '../models/Credit';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

interface CreateAppointmentRequest extends AuthRequest {
  body: {
    serviceId: string;
    date: string;
    time: string;
    moodboardId?: string;
    location?: string;
    notes?: string;
  };
}

interface UpdateAppointmentRequest extends AuthRequest {
  body: {
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    rating?: number;
    feedback?: string;
    date?: string;
    time?: string;
    location?: string;
    notes?: string;
  };
}

// @desc    Get user's appointments
// @route   GET /api/appointments
// @access  Private
export const getAppointments = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('🔍 DEBUG: getAppointments called');
  console.log('🔍 DEBUG: User ID:', req.user!._id);
  console.log('🔍 DEBUG: User ID type:', typeof req.user!._id);
  
  // First, let's see what collections exist
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('🔍 DEBUG: Available collections:', collections.map(c => c.name));
  
  // Check what's in appointments collection
  const appointmentsCollection = await mongoose.connection.db.collection('appointments').find({}).toArray();
  console.log('🔍 DEBUG: appointments collection contents:', appointmentsCollection.length, 'documents');
  
  // Also check if the specific appointment exists anywhere
  const specificAppointment = await mongoose.connection.db.collection('appointments').findOne({ 
    serviceName: "Movie Night Package" 
  });
  console.log('🔍 DEBUG: Found Movie Night Package appointment:', specificAppointment ? 'YES' : 'NO');
  
  // Query appointments collection directly
  if (appointmentsCollection.length > 0) {
    console.log('🔍 DEBUG: Using direct MongoDB query for appointments');
    const userAppointments = await mongoose.connection.db.collection('appointments').find({
      $or: [
        { userId: new mongoose.Types.ObjectId(req.user!._id) },
        { partnerId: new mongoose.Types.ObjectId(req.user!._id) }
      ]
    }).toArray();
    
    console.log('🔍 DEBUG: Found appointments for user:', userAppointments.length);
    
    // If no appointments found for user, let's check all appointments and their user IDs
    if (userAppointments.length === 0) {
      console.log('🔍 DEBUG: No appointments found for current user, checking all user IDs in collection');
      const allUserIds = await mongoose.connection.db.collection('appointments').distinct('userId');
      console.log('🔍 DEBUG: All user IDs in appointments:', allUserIds);
      console.log('🔍 DEBUG: Current user ID:', req.user!._id);
    }
    
    console.log('🔍 DEBUG: User appointments:', JSON.stringify(userAppointments, null, 2));
    
    return res.status(200).json({
      success: true,
      count: userAppointments.length,
      data: userAppointments,
    });
  }
  
  // Fallback: use Mongoose model if appointments collection is empty
  console.log('🔍 DEBUG: Fallback to Mongoose model query');
  const appointments = await Appointment.find({ 
    $or: [
      { userId: req.user!._id },
      { partnerId: req.user!._id }
    ]
  })
    .populate('userId', 'name email role')
    .populate('partnerId', 'name email role')
    .populate('moodboardId', 'moodName theme imageUrl')
    .populate('serviceId', 'name description category')
    .sort({ date: 1 });

  console.log('🔍 DEBUG: Filtered appointments for user:', appointments.length);
  console.log('🔍 DEBUG: Filtered appointments:', JSON.stringify(appointments, null, 2));

  return res.status(200).json({
    success: true,
    count: appointments.length,
    data: appointments,
  });
});

// @desc    Create a new appointment (book a service)
// @route   POST /api/appointments
// @access  Private
export const createAppointment = asyncHandler(async (req: CreateAppointmentRequest, res: Response, next: NextFunction) => {
  const { serviceId, date, time, moodboardId, location, notes } = req.body;

  // Find the service
  const service = await Service.findById(serviceId);
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

  // Create appointment
  const appointment = await Appointment.create({
    userId: req.user!._id,
    partnerId: req.user!.partnerId || req.user!._id,
    serviceId: service._id,
    serviceName: service.name,
    description: service.description,
    date: new Date(date),
    time,
    location: location || service.location,
    notes: notes || service.notes,
    status: 'pending',
    isActive: false, // Will become true when partner accepts
    moodboardId: moodboardId || undefined,
    creditCost: service.creditCost,
    category: service.category,
  });

  // Populate the appointment with related data
  await appointment.populate('userId', 'name email role');
  await appointment.populate('partnerId', 'name email role');
  await appointment.populate('moodboardId', 'moodName theme imageUrl');
  await appointment.populate('serviceId', 'name description category');

  res.status(201).json({
    success: true,
    message: `Appointment created successfully! Awaiting partner response 💕 ${selectedMoodboard ? `Mood: ${selectedMoodboard.moodName} 🎨` : ''}`,
    data: appointment,
  });
});

// @desc    Get a single appointment
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  console.log('🔍 DEBUG: getAppointment called');
  console.log('🔍 DEBUG: Appointment ID:', req.params.id);
  console.log('🔍 DEBUG: Current user ID:', req.user!._id);
  console.log('🔍 DEBUG: Current user ID type:', typeof req.user!._id);

  const appointment = await Appointment.findById(req.params.id)
    .populate('userId', 'name email role')
    .populate('partnerId', 'name email role')
    .populate('moodboardId', 'moodName theme imageUrl')
    .populate('serviceId', 'name description category');

  if (!appointment) {
    console.log('🔍 DEBUG: Appointment not found');
    return next(new AppError('Appointment not found 💔', 404));
  }

  console.log('🔍 DEBUG: Found appointment:');
  console.log('🔍 DEBUG: - appointment.userId:', appointment.userId);
  console.log('🔍 DEBUG: - appointment.partnerId:', appointment.partnerId);
  console.log('🔍 DEBUG: - userId type:', typeof appointment.userId);
  console.log('🔍 DEBUG: - partnerId type:', typeof appointment.partnerId);

  // Handle both populated and non-populated user IDs
  const appointmentUserId = appointment.userId._id || appointment.userId;
  const appointmentPartnerId = appointment.partnerId?._id || appointment.partnerId;
  
  console.log('🔍 DEBUG: - extracted appointmentUserId:', appointmentUserId);
  console.log('🔍 DEBUG: - extracted appointmentPartnerId:', appointmentPartnerId);

  // Check if user is authorized to view this appointment
  const isUserCreator = appointmentUserId.toString() === req.user!._id.toString();
  const isUserPartner = appointmentPartnerId?.toString() === req.user!._id.toString();
  
  console.log('🔍 DEBUG: - isUserCreator:', isUserCreator);
  console.log('🔍 DEBUG: - isUserPartner:', isUserPartner);

  if (!isUserCreator && !isUserPartner) {
    console.log('🔍 DEBUG: Authorization failed - user is neither creator nor partner');
    return next(new AppError('Not authorized to view this appointment 🔒', 403));
  }

  console.log('🔍 DEBUG: Authorization successful - returning appointment');
  res.status(200).json({
    success: true,
    data: appointment,
  });
});

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
export const updateAppointment = asyncHandler(async (req: UpdateAppointmentRequest, res: Response, next: NextFunction) => {
  const { status, rating, feedback, date, time, location, notes } = req.body;

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return next(new AppError('Appointment not found 💔', 404));
  }

  // Check if user is authorized to update this appointment
  if (appointment.userId.toString() !== req.user!._id.toString() && 
      appointment.partnerId?.toString() !== req.user!._id.toString()) {
    return next(new AppError('Not authorized to update this appointment 🔒', 403));
  }

  // Update fields
  if (status) appointment.status = status;
  if (rating) appointment.rating = rating;
  if (feedback) appointment.feedback = feedback;
  if (date) appointment.date = new Date(date);
  if (time) appointment.time = time;
  if (location) appointment.location = location;
  if (notes) appointment.notes = notes;

  await appointment.save();

  await appointment.populate('userId', 'name email role');
  await appointment.populate('partnerId', 'name email role');
  await appointment.populate('moodboardId', 'moodName theme imageUrl');
  await appointment.populate('serviceId', 'name description category');

  res.status(200).json({
    success: true,
    message: 'Appointment updated successfully! 💕',
    data: appointment,
  });
});

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return next(new AppError('Appointment not found 💔', 404));
  }

  // Check if user is authorized to delete this appointment
  if (appointment.userId.toString() !== req.user!._id.toString() && 
      appointment.partnerId?.toString() !== req.user!._id.toString()) {
    return next(new AppError('Not authorized to delete this appointment 🔒', 403));
  }

  // Refund credits if appointment is cancelled
  if (appointment.status !== 'completed' && appointment.status !== 'cancelled') {
    await Credit.createTransaction({
      userId: appointment.userId,
      amount: appointment.creditCost,
      type: 'earned',
      reason: `Appointment cancellation refund: ${appointment.serviceName}`,
      relatedId: appointment._id.toString(),
      relatedType: 'service',
      metadata: {
        appointmentId: appointment._id,
        serviceName: appointment.serviceName,
      }
    });
  }

  await appointment.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Appointment cancelled and credits refunded 💕',
    data: {}
  });
});

// @desc    Accept appointment (for partner)
// @route   PUT /api/appointments/:id/accept
// @access  Private
export const acceptAppointment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError('Appointment not found 💔', 404));
  }

  // Check if user is the partner
  if (appointment.partnerId?.toString() !== req.user!._id.toString()) {
    return next(new AppError('Not authorized to accept this appointment 🔒', 403));
  }

  // Check if already accepted
  if (appointment.isActive) {
    return next(new AppError('Appointment already accepted 💕', 400));
  }

  // Update appointment status
  appointment.status = 'confirmed';
  appointment.isActive = true;
  await appointment.save();

  // Populate the appointment with related data
  await appointment.populate('userId', 'name email role');
  await appointment.populate('partnerId', 'name email role');
  await appointment.populate('moodboardId', 'moodName theme imageUrl');
  await appointment.populate('serviceId', 'name description category');

  res.status(200).json({
    success: true,
    message: 'Appointment accepted! 💕',
    data: appointment,
  });
});

// @desc    Decline appointment (for partner)
// @route   PUT /api/appointments/:id/decline
// @access  Private
export const declineAppointment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const appointment = await Appointment.findById(req.params.id);

  if (!appointment) {
    return next(new AppError('Appointment not found 💔', 404));
  }

  // Check if user is the partner
  if (appointment.partnerId?.toString() !== req.user!._id.toString()) {
    return next(new AppError('Not authorized to decline this appointment 🔒', 403));
  }

  // Update appointment status
  appointment.status = 'cancelled';
  appointment.isActive = false;
  await appointment.save();

  // Refund credits to the original user
  await Credit.createTransaction({
    userId: appointment.userId,
    amount: appointment.creditCost,
    type: 'earned',
    reason: `Appointment declined - refund: ${appointment.serviceName}`,
    relatedId: appointment._id.toString(),
    relatedType: 'service',
  });

  res.status(200).json({
    success: true,
    message: 'Appointment declined. Credits refunded. 💔',
    data: appointment,
  });
});

// Rate appointment
export const rateAppointment = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { appointmentId } = req.params;
  const { rating, feedback } = req.body;
  const userId = req.user!._id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  // Validate rating
  if (!rating || rating < 1 || rating > 5) {
    return next(new AppError('Rating must be between 1 and 5', 400));
  }

  // Find appointment and ensure user is authorized
  const appointment = await Appointment.findById(appointmentId)
    .populate('userId', 'name email role')
    .populate('partnerId', 'name email role');

  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }

  // Check if user is the creator or partner of the appointment
  const isUserCreator = appointment.userId._id.toString() === userId.toString();
  const isUserPartner = appointment.partnerId?._id.toString() === userId.toString();
  
  if (!isUserCreator && !isUserPartner) {
    return next(new AppError('Not authorized to rate this appointment', 403));
  }

  // Check if appointment is completed
  if (appointment.status !== 'completed') {
    return next(new AppError('Can only rate completed appointments', 400));
  }

  // Check if already rated
  if (appointment.rating) {
    return next(new AppError('Appointment already rated', 400));
  }

  // Calculate credit multiplier based on rating
  const getCreditMultiplier = (rating: number) => {
    switch (rating) {
      case 1: return 0.5; // 50% of original points
      case 2: return 0.75; // 75% of original points
      case 3: return 1.0; // 100% of original points
      case 4: return 1.25; // 125% of original points
      case 5: return 1.5; // 150% of original points
      default: return 1.0;
    }
  };

  const multiplier = getCreditMultiplier(rating);
  const finalCredits = Math.round(appointment.creditCost * multiplier);
  const creditDifference = finalCredits - appointment.creditCost;

  // Update appointment with rating
  appointment.rating = rating;
  appointment.feedback = feedback;
  appointment.creditCost = finalCredits;
  await appointment.save();

  // Update user credits
  await User.findByIdAndUpdate(userId, { $inc: { credits: creditDifference } });

  // Create credit transaction record
  await Credit.createTransaction({
    userId: userId,
    amount: Math.abs(creditDifference),
    type: creditDifference > 0 ? 'earned' : 'deducted',
    reason: `Appointment rating: ${rating}/5 stars`,
    relatedId: appointmentId,
    relatedType: 'appointment',
    metadata: {
      appointmentId: appointmentId,
      rating: rating,
      feedback: feedback,
      creditCost: finalCredits,
    }
  });

  res.status(200).json({
    success: true,
    data: {
      appointment,
      creditChange: creditDifference,
      finalCredits
    },
    message: 'Appointment rated successfully'
  });
});

// Get appointment rating
export const getAppointmentRating = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { appointmentId } = req.params;
  const userId = req.user!._id;

  if (!userId) {
    return next(new AppError('User not authenticated', 401));
  }

  const appointment = await Appointment.findById(appointmentId)
    .populate('userId', 'name email role')
    .populate('partnerId', 'name email role');

  if (!appointment) {
    return next(new AppError('Appointment not found', 404));
  }

  // Check if user is authorized
  const isUserCreator = appointment.userId._id.toString() === userId.toString();
  const isUserPartner = appointment.partnerId?._id.toString() === userId.toString();
  
  if (!isUserCreator && !isUserPartner) {
    return next(new AppError('Not authorized to view this appointment', 403));
  }

  res.status(200).json({
    success: true,
    data: {
      rating: appointment.rating,
      feedback: appointment.feedback,
      creditCost: appointment.creditCost
    }
  });
});
