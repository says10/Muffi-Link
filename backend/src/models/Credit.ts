import mongoose, { Document, Schema } from 'mongoose';

export interface ICredit extends Document {
  userId: string;
  amount: number;
  type: 'earned' | 'spent' | 'deducted' | 'refund';
  reason: string;
  relatedId?: string;
  relatedType?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreditModel extends mongoose.Model<ICredit> {
  getBalance(userId: string): Promise<number>;
  addCredits(userId: string, amount: number, reason: string, relatedId?: string, relatedType?: string): Promise<any>;
  spendCredits(userId: string, amount: number, reason: string, relatedId?: string, relatedType?: string): Promise<any>;
  createTransaction(data: any): Promise<any>;
  getUserBalance(userId: string): Promise<number>;
}

const creditSchema = new Schema<ICredit>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['earned', 'spent', 'deducted', 'refund'],
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  relatedId: {
    type: String
  },
  relatedType: {
    type: String,
    enum: ['appointment', 'grievance', 'service', 'love_note', 'memory']
  },
  metadata: {
    type: Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
creditSchema.index({ userId: 1, createdAt: -1 });
creditSchema.index({ type: 1, createdAt: -1 });

// Static method to get user's credit balance
creditSchema.statics.getBalance = async function(userId: string): Promise<number> {
  const result = await this.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: null,
        totalEarned: {
          $sum: {
            $cond: [
              { $in: ['$type', ['earned', 'refund']] },
              '$amount',
              0
            ]
          }
        },
        totalSpent: {
          $sum: {
            $cond: [
              { $in: ['$type', ['spent', 'deducted']] },
              { $abs: '$amount' },
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        balance: { $subtract: ['$totalEarned', '$totalSpent'] }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].balance : 0;
};

// Static method to add credits
creditSchema.statics.addCredits = async function(
  userId: string, 
  amount: number, 
  reason: string, 
  relatedId?: string, 
  relatedType?: string
): Promise<any> {
  const credit = new this({
    userId: userId,
    amount: Math.abs(amount),
    type: amount >= 0 ? 'earned' : 'deducted',
    reason,
    relatedId: relatedId || undefined,
    relatedType
  });
  
  return await credit.save();
};

// Static method to spend credits
creditSchema.statics.spendCredits = async function(
  userId: string, 
  amount: number, 
  reason: string, 
  relatedId?: string, 
  relatedType?: string
): Promise<any> {
  const credit = new this({
    userId: userId,
    amount: Math.abs(amount),
    type: 'spent',
    reason,
    relatedId: relatedId || undefined,
    relatedType
  });
  
  return await credit.save();
};

// Static method to create a transaction
creditSchema.statics.createTransaction = async function(data: any): Promise<any> {
  const credit = new this(data);
  return await credit.save();
};

// Static method to get user balance (alias for getBalance)
creditSchema.statics.getUserBalance = async function(userId: string): Promise<number> {
  console.log('🔍 Getting balance for user:', userId);
  
  const result = await this.aggregate([
    { $match: { userId: userId } },
    {
      $group: {
        _id: null,
        totalEarned: {
          $sum: {
            $cond: [
              { $in: ['$type', ['earned', 'refund']] },
              '$amount',
              0
            ]
          }
        },
        totalSpent: {
          $sum: {
            $cond: [
              { $in: ['$type', ['spent', 'deducted']] },
              { $abs: '$amount' },
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        balance: { $subtract: ['$totalEarned', '$totalSpent'] }
      }
    }
  ]);
  
  const balance = result.length > 0 ? result[0].balance : 0;
  console.log('🔍 User balance calculation:', {
    userId,
    totalEarned: result[0]?.totalEarned || 0,
    totalSpent: result[0]?.totalSpent || 0,
    balance
  });
  
  return balance;
};

const Credit = mongoose.model<ICredit, ICreditModel>('Credit', creditSchema);

export default Credit;
