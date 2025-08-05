import express from 'express';
import {
  shareMemory,
  getReceivedMemories,
  getSharedMemories,
  getMemory,
  updateMemory,
  deleteMemory,
  getUnreadCount,
  getMemoriesByTag
} from '../controllers/memoryController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router
  .route('/')
  .post(shareMemory);

router
  .route('/received')
  .get(getReceivedMemories);

router
  .route('/shared')
  .get(getSharedMemories);

router
  .route('/unread-count')
  .get(getUnreadCount);

router
  .route('/tags/:tag')
  .get(getMemoriesByTag);

router
  .route('/:id')
  .get(getMemory)
  .put(updateMemory)
  .delete(deleteMemory);

export default router; 