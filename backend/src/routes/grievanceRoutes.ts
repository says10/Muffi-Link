import express from 'express';
import { protect } from '../middleware/auth';
import {
  createGrievance,
  getGrievances,
  getGrievance,
  updateGrievance,
  deleteGrievance,
  getGrievanceStats
} from '../controllers/grievanceController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Grievance routes
router.post('/', createGrievance);
router.get('/', getGrievances);
router.get('/stats', getGrievanceStats);
router.get('/:grievanceId', getGrievance);
router.put('/:grievanceId', updateGrievance);
router.delete('/:grievanceId', deleteGrievance);

export default router; 