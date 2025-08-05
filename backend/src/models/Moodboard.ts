import mongoose, { Document, Schema } from 'mongoose';

export interface IMoodboard extends Document {
  _id: string;
  userId: string;
  moodName: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  customText: string;
  theme: string;
  backgroundColor?: string;
  textColor?: string;
  isActive: boolean;
  isDefault: boolean;
  emoji?: string;
  createdAt: Date;
  updatedAt: Date;
}

const moodboardSchema = new Schema<IMoodboard>({
  userId: {
    type: String,
    ref: 'User',
    required: [true, 'User ID is required 💕']
  },
  moodName: {
    type: String,
    required: [true, 'Mood name is required 💭'],
    trim: true,
    maxlength: [30, 'Mood name cannot be more than 30 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters'],
    default: ''
  },
  imageUrl: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    default: null
  },
  customText: {
    type: String,
    trim: true,
    maxlength: [500, 'Custom text cannot be more than 500 characters'],
    default: ''
  },
  theme: {
    type: String,
    default: 'romantic'
  },
  backgroundColor: {
    type: String,
    default: '#FF6B9D'
  },
  textColor: {
    type: String,
    default: '#FFFFFF'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  emoji: {
    type: String,
    default: '💕'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
moodboardSchema.index({ userId: 1 });
moodboardSchema.index({ userId: 1, isActive: 1 });
moodboardSchema.index({ userId: 1, isDefault: 1 });

// Ensure only one active mood per user
moodboardSchema.pre('save', async function(next) {
  if (this.isActive && this.isModified('isActive')) {
    await Moodboard.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

// Virtual for user information
moodboardSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

const Moodboard = mongoose.model<IMoodboard>('Moodboard', moodboardSchema);

export default Moodboard;
