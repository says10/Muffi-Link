import express from 'express';
import {
  sendLoveNote,
  getReceivedLoveNotes,
  getSentLoveNotes,
  getLoveNote,
  updateLoveNote,
  deleteLoveNote,
  getUnreadCount
} from '../controllers/loveNoteController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router
  .route('/')
  .post(sendLoveNote);

router
  .route('/received')
  .get(getReceivedLoveNotes);

router
  .route('/sent')
  .get(getSentLoveNotes);

router
  .route('/unread-count')
  .get(getUnreadCount);

router
  .route('/:id')
  .get(getLoveNote)
  .put(updateLoveNote)
  .delete(deleteLoveNote);

export default router; 