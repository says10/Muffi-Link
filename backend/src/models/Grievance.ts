import mongoose, { Document, Schema } from 'mongoose';
import Credit from './Credit';

export interface IGrievance extends Document {
  _id: string;
  userId: string;
  partnerId: string;
  title: string;
  description: string;
  rating: number;
  creditImpact?: number;
  status: 'pending' | 'resolved' | 'dismissed';
  category: 'communication' | 'behavior' | 'responsibility' | 'affection' | 'time' | 'other';
  severity: 'low' | 'medium' | 'high';
  responseText?: string;
  resolvedAt?: Date;
  isAnonymous: boolean;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const grievanceSchema = new Schema<IGrievance>({
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
  title: {
    type: String,
    required: [true, 'Grievance title is required 📝'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Grievance description is required 💭'],
    trim: true,
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required ⭐'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  creditImpact: {
    type: Number,
    required: false,
    validate: {
      validator: function(value: number) {
        // Negative values for deductions, positive for rewards
        return value >= -100 && value <= 50;
      },
      message: 'Credit impact must be between -100 and +50'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending'
  },
  category: {
    type: String,
    enum: ['communication', 'behavior', 'responsibility', 'affection', 'time', 'other'],
    required: [true, 'Category is required 📂']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  responseText: {
    type: String,
    trim: true,
    maxlength: [500, 'Response cannot be more than 500 characters']
  },
  resolvedAt: {
    type: Date,
    default: null
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: [],
    validate: {
      validator: function(tags: string[]) {
        return tags.length <= 5;
      },
      message: 'Cannot have more than 5 tags'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
grievanceSchema.index({ userId: 1 });
grievanceSchema.index({ partnerId: 1 });
grievanceSchema.index({ status: 1 });
grievanceSchema.index({ category: 1 });
grievanceSchema.index({ severity: 1 });
grievanceSchema.index({ createdAt: -1 });
grievanceSchema.index({ userId: 1, status: 1 });
grievanceSchema.index({ partnerId: 1, status: 1 });

// Virtual for user information
grievanceSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Virtual for partner information
grievanceSchema.virtual('partner', {
  ref: 'User',
  localField: 'partnerId',
  foreignField: '_id',
  justOne: true
});

// Auto-calculate credit impact based on rating and severity
grievanceSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('rating') || this.isModified('severity')) {
    let baseImpact = 0;
    
    // Base impact based on rating (1 = worst, 5 = best)
    switch (this.rating) {
      case 1:
        baseImpact = -20;
        break;
      case 2:
        baseImpact = -10;
        break;
      case 3:
        baseImpact = 0;
        break;
      case 4:
        baseImpact = 5;
        break;
      case 5:
        baseImpact = 10;
        break;
    }
    
    // Multiply by severity
    switch (this.severity) {
      case 'low':
        baseImpact *= 0.5;
        break;
      case 'medium':
        baseImpact *= 1;
        break;
      case 'high':
        baseImpact *= 2;
        break;
    }
    
    this.creditImpact = Math.round(baseImpact);
  }
  
  // Set resolved date when status changes to resolved
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  
  next();
});

// Post-save middleware to update partner's credits
grievanceSchema.post('save', async function(doc) {
  if (doc.status === 'resolved' && doc.creditImpact && doc.creditImpact !== 0) {
    
    await Credit.createTransaction({
      userId: doc.partnerId,
      amount: doc.creditImpact,
      type: doc.creditImpact > 0 ? 'earned' : 'deducted',
      reason: doc.creditImpact > 0 
        ? `Positive feedback received 💕` 
        : `Areas for improvement identified 💭`,
      relatedId: doc._id,
      relatedType: 'grievance'
    });
  }
});

const Grievance = mongoose.model<IGrievance>('Grievance', grievanceSchema);

export default Grievance;
