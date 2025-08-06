import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  partnerId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  serviceName: string;
  description?: string;
  date: Date;
  time: string;
  location?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  isActive: boolean;
  moodboardId?: mongoose.Types.ObjectId;
  creditCost: number;
  category: 'date' | 'gift' | 'activity' | 'surprise' | 'help' | 'custom';
  rating?: number;
  feedback?: string;
  customServiceId?: string; // For custom services that don't have MongoDB ObjectIds
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  serviceId: {
    type: Schema.Types.ObjectId,
    ref: 'Service',
  },
  serviceName: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
  },
  isActive: {
    type: Boolean,
    default: false,
    required: true,
  },
  moodboardId: {
    type: Schema.Types.ObjectId,
    ref: 'Moodboard',
  },
  creditCost: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    enum: ['date', 'gift', 'activity', 'surprise', 'help', 'custom'],
    required: true,
  },
  customServiceId: {
    type: String,
    // For custom services that don't have MongoDB ObjectIds
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  feedback: {
    type: String,
  },
}, {
  timestamps: true,
  collection: 'appointments' // Use standard appointments collection
});

// Index for efficient queries
appointmentSchema.index({ userId: 1, date: 1 });
appointmentSchema.index({ partnerId: 1, date: 1 });
appointmentSchema.index({ status: 1 });

export default mongoose.model<IAppointment>('Appointment', appointmentSchema);
