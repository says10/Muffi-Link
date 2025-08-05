import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  _id: string;
  name: string;
  description: string;
  date: Date;
  time: string;
  userId: string;
  partnerId: string;
  moodboardId?: string; // Selected moodboard for this service
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  creditCost: number;
  isCustom: boolean;
  category: 'date' | 'gift' | 'activity' | 'surprise' | 'help' | 'custom' | 'love_note' | 'memory';
  location?: string;
  notes?: string;
  completedAt?: Date;
  rating?: number;
  feedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>({
  name: {
    type: String,
    required: [true, 'Service name is required 💕'],
    trim: true,
    maxlength: [100, 'Service name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Service description is required 💭'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Service date is required 📅'],
    validate: {
      validator: function(value: Date) {
        return value >= new Date();
      },
      message: 'Service date cannot be in the past 💔'
    }
  },
  time: {
    type: String,
    required: [true, 'Service time is required ⏰'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide time in HH:MM format']
  },
  userId: {
    type: String,
    ref: 'User',
    required: [true, 'User ID is required 👤']
  },
  partnerId: {
    type: String,
    ref: 'User',
    required: [true, 'Partner ID is required 💑']
  },
  moodboardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Moodboard',
    required: false,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  creditCost: {
    type: Number,
    required: [true, 'Credit cost is required 💎'],
    min: [0, 'Credit cost cannot be negative'],
    max: [1000, 'Credit cost cannot exceed 1000']
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    enum: ['date', 'gift', 'activity', 'surprise', 'help', 'custom', 'love_note', 'memory'],
    required: [true, 'Service category is required 📂']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  completedAt: {
    type: Date,
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: {
    type: String,
    trim: true,
    maxlength: [500, 'Feedback cannot be more than 500 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
serviceSchema.index({ userId: 1 });
serviceSchema.index({ partnerId: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ date: 1 });
serviceSchema.index({ userId: 1, status: 1 });
serviceSchema.index({ partnerId: 1, status: 1 });

// Virtual for user information
serviceSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for partner information
serviceSchema.virtual('partner', {
  ref: 'User',
  localField: 'partnerId',
  foreignField: '_id',
  justOne: true
});

// Virtual for moodboard information
serviceSchema.virtual('moodboard', {
  ref: 'Moodboard',
  localField: 'moodboardId',
  foreignField: '_id',
  justOne: true
});

// Auto-update completedAt when status changes to completed
serviceSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

const Service = mongoose.model<IService>('Service', serviceSchema);

export default Service;
