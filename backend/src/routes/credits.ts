import { Router } from 'express';
import {
  getCreditBalance,
  getCreditHistory,
  addCredits,
  spendCredits,
  transferCredits,
  getPartnerBalance,
  getCoupleStats,
  getCreditLeaderboard,
  processRefund,
  getUserDebugStats,
  initializeCreditsManually,
} from '../controllers/creditController';
import {
  validateCreditTransaction,
  validatePagination,
} from '../middleware/validation';
import { protect, checkPartnership } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(protect);

// Credit balance and history
router.get('/balance', getCreditBalance);
router.get('/history', validatePagination, getCreditHistory);
router.get('/debug/stats', getUserDebugStats);

// Credit transactions
router.post('/add', validateCreditTransaction, addCredits);
router.post('/spend', validateCreditTransaction, spendCredits);
router.post('/refund', validateCreditTransaction, processRefund);
router.post('/initialize', initializeCreditsManually);

// Partner-related credit operations
router.post('/transfer', transferCredits);
router.get('/partner-balance', getPartnerBalance);

// Couple statistics and leaderboard
router.get('/couple-stats', getCoupleStats);
router.get('/leaderboard', getCreditLeaderboard);

export default router;
