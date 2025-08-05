import express from 'express';
import { protect } from '../middleware/auth';
import {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  deleteAppointment,
  acceptAppointment,
  declineAppointment,
  rateAppointment,
  getAppointmentRating
} from '../controllers/appointmentController';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Appointment routes
router.post('/', createAppointment);
router.get('/', getAppointments);
router.get('/:appointmentId', getAppointment);
router.put('/:appointmentId', updateAppointment);
router.delete('/:appointmentId', deleteAppointment);

// Appointment actions
router.put('/:appointmentId/accept', acceptAppointment);
router.put('/:appointmentId/decline', declineAppointment);

// Rating routes
router.put('/:appointmentId/rate', rateAppointment);
router.get('/:appointmentId/rating', getAppointmentRating);

export default router;
