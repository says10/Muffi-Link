import { Response, NextFunction } from 'express';
import Credit, { ICredit } from '../models/Credit';
import User from '../models/User';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { getUserStats } from '../utils/userDataInitializer';

// Helper function to map model names to valid enum values
const mapRelatedModel = (model?: string): 'service' | 'grievance' | 'bonus' | 'transfer' | 'manual' => {
  if (!model) return 'manual';
  
  const mapping: { [key: string]: 'service' | 'grievance' | 'bonus' | 'transfer' | 'manual' } = {
    'Service': 'service',
    'service': 'service',
    'Grievance': 'grievance', 
    'grievance': 'grievance',
    'Moodboard': 'manual',
    'moodboard': 'manual',
    'User': 'transfer',
    'user': 'transfer',
    'bonus': 'bonus',
    'transfer': 'transfer',
    'manual': 'manual'
  };
  
  return mapping[model] || 'manual';
};

interface CreditTransactionRequest extends AuthRequest {
  body: {
    amount: number;
    type: 'earned' | 'spent' | 'bonus' | 'penalty' | 'refund';
    description: string;
    relatedId?: string;
    relatedModel?: string; // Allow any string, we'll map it properly
  };
}

interface TransferCreditsRequest extends AuthRequest {
  body: {
    amount: number;
    description: string;
  };
}

// @desc    Get user's credit balance
// @route   GET /api/credits/balance
// @access  Private
export const getCreditBalance = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 Getting credit balance for user:', req.user!._id);
    console.log('🔍 User ID type:', typeof req.user!._id);
    console.log('🔍 User ID string:', req.user!._id.toString());
    
    // Use string version since that's what's stored in the database
    const userIdString = req.user!._id.toString();
    
    // Check if user has any credit records
    const creditRecords = await Credit.find({ userId: userIdString });
    
    console.log('📊 Credit records found with string userId:', creditRecords.length);
    
    if (creditRecords.length > 0) {
      console.log('💳 Sample record:', creditRecords[0]);
    }
    
    // Use string version for balance calculation since that's what's stored in DB
    const balance = await Credit.getBalance(userIdString);
    console.log('💰 Retrieved balance:', balance);
    
    // Debug: Let's also check all credit records for this user
    const allCredits = await Credit.find({ userId: userIdString }).sort({ createdAt: -1 });
    console.log('📊 All credit records for user:', allCredits.length);
    allCredits.forEach((credit, index) => {
      console.log(`  ${index + 1}. Type: ${credit.type}, Amount: ${credit.amount}, Reason: ${credit.reason}`);
    });

    res.status(200).json({
      success: true,
      data: {
        balance,
        userId: req.user!._id,
        totalRecords: creditRecords.length,
      },
    });
  } catch (error) {
    console.error('❌ Error getting credit balance:', error);
    throw error;
  }
});

// @desc    Get user's credit transaction history
// @route   GET /api/credits/history
// @access  Private
export const getCreditHistory = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const sort = req.query.sort as string || '-createdAt';

  const skip = (page - 1) * limit;

  const transactions = await Credit.find({ userId: req.user!._id })
    .sort(sort)
    .limit(limit)
    .skip(skip)
    .populate('relatedId', 'title name')
    .lean();

  const total = await Credit.countDocuments({ userId: req.user!._id });
  const totalPages = Math.ceil(total / limit);

  res.status(200).json({
    success: true,
    data: {
      transactions,
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

// @desc    Add credits to user account
// @route   POST /api/credits/add
// @access  Private (Admin or system)
export const addCredits = asyncHandler(async (req: CreditTransactionRequest, res: Response, next: NextFunction) => {
  const { amount, description, relatedId, relatedModel } = req.body;

  const mappedModel = mapRelatedModel(relatedModel);

  const transaction = await Credit.addCredits(
    req.user!._id,
    amount,
    description,
    relatedId,
    mappedModel
  );

  const newBalance = await Credit.getBalance(req.user!._id);

  res.status(201).json({
    success: true,
    message: `Successfully added ${amount} credits! 💎`,
    data: {
      transaction,
      newBalance,
    },
  });
});

// @desc    Spend credits from user account
// @route   POST /api/credits/spend
// @access  Private
export const spendCredits = asyncHandler(async (req: CreditTransactionRequest, res: Response, next: NextFunction) => {
  const { amount, description, relatedId, relatedModel } = req.body;

  const mappedModel = mapRelatedModel(relatedModel);

  try {
    const transaction = await Credit.spendCredits(
      req.user!._id,
      amount,
      description,
      relatedId,
      mappedModel
    );

    const newBalance = await Credit.getBalance(req.user!._id);

    res.status(201).json({
      success: true,
      message: `Successfully spent ${amount} credits! 💸`,
      data: {
        transaction,
        newBalance,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('insufficient')) {
      return next(new AppError('Insufficient credits for this transaction 💔', 400));
    }
    return next(new AppError('Failed to process credit transaction 💔', 500));
  }
});

// @desc    Transfer credits to partner
// @route   POST /api/credits/transfer
// @access  Private
export const transferCredits = asyncHandler(async (req: TransferCreditsRequest, res: Response, next: NextFunction) => {
  const { amount, description } = req.body;
  const currentUser = req.user!;

  if (!currentUser.partnerId) {
    return next(new AppError('You must be linked with a partner to transfer credits 💔', 400));
  }

  // Check if user has enough credits
  const currentBalance = await Credit.getBalance(currentUser._id);
  if (currentBalance < amount) {
    return next(new AppError('Insufficient credits for this transfer 💔', 400));
  }

  // Spend credits from sender
  await Credit.spendCredits(
    currentUser._id,
    amount,
    `Transferred to partner: ${description} 💕`,
    currentUser.partnerId,
    'transfer'
  );

  // Add credits to receiver
  await Credit.addCredits(
    currentUser.partnerId,
    amount,
    `Received from partner: ${description} 💕`,
    currentUser._id,
    'transfer'
  );

  const newBalance = await Credit.getBalance(currentUser._id);
  const partnerBalance = await Credit.getBalance(currentUser.partnerId);

  res.status(201).json({
    success: true,
    message: `Successfully transferred ${amount} credits to your partner! 💕`,
    data: {
      newBalance,
      partnerBalance,
      transferAmount: amount,
    },
  });
});

// @desc    Get partner's credit balance (if linked)
// @route   GET /api/credits/partner-balance
// @access  Private
export const getPartnerBalance = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = req.user!;

  if (!currentUser.partnerId) {
    return next(new AppError('You must be linked with a partner to view their balance 💔', 400));
  }

  const partnerBalance = await Credit.getBalance(currentUser.partnerId);
  const partner = await User.findById(currentUser.partnerId).select('firstName lastName');

  res.status(200).json({
    success: true,
    data: {
      balance: partnerBalance,
      partner: {
        _id: currentUser.partnerId,
        firstName: partner?.firstName,
        lastName: partner?.lastName,
      },
    },
  });
});

// @desc    Get combined credit statistics for the couple
// @route   GET /api/credits/couple-stats
// @access  Private
export const getCoupleStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = req.user!;

  if (!currentUser.partnerId) {
    return next(new AppError('You must be linked with a partner to view couple stats 💔', 400));
  }

  const userBalance = await Credit.getBalance(currentUser._id);
  const partnerBalance = await Credit.getBalance(currentUser.partnerId);

  // Get transaction counts for both users
  const userTransactionCount = await Credit.countDocuments({ userId: currentUser._id });
  const partnerTransactionCount = await Credit.countDocuments({ userId: currentUser.partnerId });

  // Get recent transactions for both users
  const recentTransactions = await Credit.find({
    userId: { $in: [currentUser._id, currentUser.partnerId] }
  })
    .sort('-createdAt')
    .limit(10)
    .populate('userId', 'firstName lastName role')
    .populate('relatedId', 'title name')
    .lean();

  // Calculate total earned and spent for the couple
  const userStats = await Credit.aggregate([
    { $match: { userId: currentUser._id } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const partnerStats = await Credit.aggregate([
    { $match: { userId: currentUser.partnerId } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  const combinedBalance = userBalance + partnerBalance;

  res.status(200).json({
    success: true,
    data: {
      combinedBalance,
      userBalance,
      partnerBalance,
      totalTransactions: userTransactionCount + partnerTransactionCount,
      recentTransactions,
      statistics: {
        user: userStats,
        partner: partnerStats,
      },
    },
  });
});

// @desc    Get credit leaderboard (top earners/spenders)
// @route   GET /api/credits/leaderboard
// @access  Private
export const getCreditLeaderboard = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const currentUser = req.user!;

  if (!currentUser.partnerId) {
    return next(new AppError('You must be linked with a partner to view leaderboard 💔', 400));
  }

  // Get top earners between the couple
  const earningsStats = await Credit.aggregate([
    {
      $match: {
        userId: { $in: [currentUser._id, currentUser.partnerId] },
        type: { $in: ['earned', 'bonus'] }
      }
    },
    {
      $group: {
        _id: '$userId',
        totalEarned: { $sum: '$amount' },
        earnTransactions: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $sort: { totalEarned: -1 }
    }
  ]);

  // Get top spenders between the couple
  const spendingStats = await Credit.aggregate([
    {
      $match: {
        userId: { $in: [currentUser._id, currentUser.partnerId] },
        type: 'spent'
      }
    },
    {
      $group: {
        _id: '$userId',
        totalSpent: { $sum: '$amount' },
        spendTransactions: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    {
      $unwind: '$user'
    },
    {
      $sort: { totalSpent: -1 }
    }
  ]);

  res.status(200).json({
    success: true,
    data: {
      topEarners: earningsStats,
      topSpenders: spendingStats,
    },
  });
});

// @desc    Process credit refund
// @route   POST /api/credits/refund
// @access  Private
export const processRefund = asyncHandler(async (req: CreditTransactionRequest, res: Response, next: NextFunction) => {
  const { amount, description, relatedId, relatedModel } = req.body;

  const mappedModel = mapRelatedModel(relatedModel);

  const transaction = await Credit.addCredits(
    req.user!._id,
    amount,
    `Refund: ${description} 💰`,
    relatedId,
    mappedModel
  );

  // Create a refund transaction
  const refundTransaction = await Credit.createTransaction({
    userId: req.user!._id,
    amount: amount,
    type: 'refund',
    reason: `Refund: ${description}`,
    relatedId: relatedId,
    relatedType: mappedModel
  });

  const newBalance = await Credit.getBalance(req.user!._id);

  res.status(201).json({
    success: true,
    message: `Refund of ${amount} credits processed successfully! 💰`,
    data: {
      transaction: refundTransaction,
      newBalance,
    },
  });
});

// @desc    Get user stats for debugging
// @route   GET /api/credits/debug/stats
// @access  Private
export const getUserDebugStats = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const stats = await getUserStats(req.user!._id.toString());

  // Also get database info
  const dbInfo = {
    databaseName: Credit.db.name,
    collectionName: Credit.collection.name,
    connectionState: Credit.db.readyState,
  };

  // Get all collections in the database
  const collections = await Credit.db.db.listCollections().toArray();
  const collectionNames = collections.map(col => col.name);

  // Count documents in credits collection
  const totalCredits = await Credit.countDocuments();
  const userCredits = await Credit.countDocuments({ userId: req.user!._id.toString() });

  res.status(200).json({
    success: true,
    data: {
      ...stats,
      database: dbInfo,
      collections: collectionNames,
      creditCounts: {
        total: totalCredits,
        forUser: userCredits
      }
    },
  });
});

// @desc    Manually initialize credits for existing user
// @route   POST /api/credits/initialize
// @access  Private
export const initializeCreditsManually = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    console.log('🎁 Manually initializing credits for user:', req.user!._id);
    
    // Check if user already has credits
    const currentBalance = await Credit.getBalance(req.user!._id.toString());
    
    if (currentBalance > 0) {
      res.status(400).json({
        success: false,
        message: `User already has ${currentBalance} credits. No initialization needed.`,
      });
      return;
    }
    
    // Add 20 welcome credits
    await Credit.addCredits(
      req.user!._id.toString(), 
      20, 
      'Manual initialization - Welcome to Muffi-Link! 💕', 
      undefined, 
      'bonus'
    );
    
    const newBalance = await Credit.getBalance(req.user!._id.toString());
    console.log('✅ Credits initialized. New balance:', newBalance);
    
    res.status(200).json({
      success: true,
      message: 'Credits initialized successfully! 🎉',
      data: {
        newBalance,
        userId: req.user!._id,
      },
    });
  } catch (error) {
    console.error('❌ Error initializing credits:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing credits',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
