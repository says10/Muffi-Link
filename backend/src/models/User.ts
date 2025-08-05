import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  accessKey: string;
  role: 'boyfriend' | 'girlfriend' | 'partner';
  partnerId?: string;
  relationshipStartDate?: Date;
  credits: number;
  avatar?: string;
  phone?: string;
  dateOfBirth?: Date;
  bio?: string;
  anniversaryDate?: Date;
  isVerified: boolean;
  lastLogin?: Date;
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  matchPassword(enteredPassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
  generateAccessKey(): string;
}

const userSchema = new Schema<IUser>({
  firstName: {
    type: String,
    required: [true, 'Please add a first name 💕'],
    trim: true,
    maxlength: [30, 'First name cannot be more than 30 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name 💕'],
    trim: true,
    maxlength: [30, 'Last name cannot be more than 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email 💌'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email 💔'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password 🔐'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  accessKey: {
    type: String,
    required: [true, 'Access key is required 🗝️'],
    unique: false, // allow multiple users to use the same key
    select: true
  },
  role: {
    type: String,
    enum: ['boyfriend', 'girlfriend', 'partner'],
    required: [true, 'Please specify your role in the relationship 💕']
  },
  partnerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  relationshipStartDate: {
    type: Date
  },
  credits: {
    type: Number,
    default: 20,
    min: [0, 'Credits cannot be negative 💔']
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  dateOfBirth: {
    type: Date
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  anniversaryDate: {
    type: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpire: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ accessKey: 1 });
userSchema.index({ partnerId: 1 });

// Virtual for partner information
userSchema.virtual('partner', {
  ref: 'User',
  localField: 'partnerId',
  foreignField: '_id',
  justOne: true
});

// Encrypt password and access key using bcrypt
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Note: hashedAccessKey is handled in the controller to avoid double hashing
  next();
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword: string): Promise<boolean> {
  if (arguments.length === 1) {
    // If only one argument, it's for password verification
    return await bcrypt.compare(enteredPassword, this.password);
  } else {
    // If called with access key parameter
    return await bcrypt.compare(enteredPassword, this.accessKey);
  }
};

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function(): string {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role,
      partnerId: this.partnerId 
    } as any,
    process.env.JWT_SECRET!,
    {
      expiresIn: process.env.JWT_EXPIRE || '7d',
    } as any
  );
};

// Generate access key
userSchema.methods.generateAccessKey = function(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Pre-remove middleware to handle partner disconnection
userSchema.pre('deleteOne', { document: true }, async function() {
  if (this.partnerId) {
    await User.findByIdAndUpdate(this.partnerId, {
      $unset: { partnerId: 1, relationshipStartDate: 1 }
    });
  }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;
