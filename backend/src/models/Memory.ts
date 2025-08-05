import mongoose, { Document, Schema } from 'mongoose';

export interface IMemory extends Document {
  _id: string;
  senderId: string;
  receiverId: string;
  title: string;
  description: string;
  memoryDate: Date;
  imageUrl?: string;
  videoUrl?: string;
  location?: string;
  moodboardId?: string;
  isRead: boolean;
  isFavorite: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const memorySchema = new Schema<IMemory>({
  senderId: {
    type: String,
    ref: 'User',
    required: [true, 'Sender ID is required 💕']
  },
  receiverId: {
    type: String,
    ref: 'User',
    required: [true, 'Receiver ID is required 💕']
  },
  title: {
    type: String,
    required: [true, 'Memory title is required 💭'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Memory description is required 💭'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  memoryDate: {
    type: Date,
    required: [true, 'Memory date is required 📅'],
    validate: {
      validator: function(value: Date) {
        return value <= new Date();
      },
      message: 'Memory date cannot be in the future 💔'
    }
  },
  imageUrl: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    default: null
  },
  location: {
    type: String,
    trim: true,
    maxlength: [200, 'Location cannot be more than 200 characters']
  },
  moodboardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Moodboard',
    required: false,
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
memorySchema.index({ senderId: 1, createdAt: -1 });
memorySchema.index({ receiverId: 1, isRead: 1 });
memorySchema.index({ receiverId: 1, isFavorite: 1 });
memorySchema.index({ memoryDate: -1 });
memorySchema.index({ tags: 1 });

// Virtual for sender information
memorySchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
});

// Virtual for receiver information
memorySchema.virtual('receiver', {
  ref: 'User',
  localField: 'receiverId',
  foreignField: '_id',
  justOne: true
});

// Virtual for moodboard information
memorySchema.virtual('moodboard', {
  ref: 'Moodboard',
  localField: 'moodboardId',
  foreignField: '_id',
  justOne: true
});

const Memory = mongoose.model<IMemory>('Memory', memorySchema);

export default Memory; 