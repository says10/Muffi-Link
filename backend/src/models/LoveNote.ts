import mongoose, { Document, Schema } from 'mongoose';

export interface ILoveNote extends Document {
  _id: string;
  senderId: string;
  receiverId: string;
  title: string;
  content: string;
  moodboardId?: string;
  isRead: boolean;
  isFavorite: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const loveNoteSchema = new Schema<ILoveNote>({
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
    required: [true, 'Note title is required 💭'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Note content is required 💭'],
    trim: true,
    maxlength: [1000, 'Content cannot be more than 1000 characters']
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
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for faster queries
loveNoteSchema.index({ senderId: 1, createdAt: -1 });
loveNoteSchema.index({ receiverId: 1, isRead: 1 });
loveNoteSchema.index({ receiverId: 1, isFavorite: 1 });

// Virtual for sender information
loveNoteSchema.virtual('sender', {
  ref: 'User',
  localField: 'senderId',
  foreignField: '_id',
  justOne: true
});

// Virtual for receiver information
loveNoteSchema.virtual('receiver', {
  ref: 'User',
  localField: 'receiverId',
  foreignField: '_id',
  justOne: true
});

// Virtual for moodboard information
loveNoteSchema.virtual('moodboard', {
  ref: 'Moodboard',
  localField: 'moodboardId',
  foreignField: '_id',
  justOne: true
});

const LoveNote = mongoose.model<ILoveNote>('LoveNote', loveNoteSchema);

export default LoveNote; 