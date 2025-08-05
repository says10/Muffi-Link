import express from 'express';
import {
  getServices,
  getBookings,
  createService,
  bookService,
  updateServiceStatus,
  getService,
  deleteService
} from '../controllers/serviceController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes
router
  .route('/')
  .get(getServices)
  .post(createService);

router
  .route('/bookings')
  .get(getBookings);

router
  .route('/:id')
  .get(getService)
  .delete(deleteService);

router
  .route('/:id/book')
  .post(bookService);

router
  .route('/:id/status')
  .put(updateServiceStatus);

export default router;
