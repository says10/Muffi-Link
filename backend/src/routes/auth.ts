import { Router } from 'express';
import {
  signup,
  signin,
  logout,
  getMe,
  updateDetails,
  updatePassword,
  linkPartner,
  unlinkPartner,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import {
  validateSignup,
  validateSignin,
  validateAccessKey,
} from '../middleware/validation';
import { protect, sensitiveOperationLimit } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/signup', validateSignup, signup);
router.post('/signin', validateSignin, signin);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Protected routes (require authentication)
router.use(protect); // All routes after this middleware are protected

router.post('/logout', logout);
router.get('/me', getMe);
router.put('/updatedetails', updateDetails);
router.put(
  '/updatepassword',
  sensitiveOperationLimit(5, 15 * 60 * 1000), // 5 attempts per 15 minutes
  updatePassword
);
router.post(
  '/link-partner',
  validateAccessKey,
  sensitiveOperationLimit(3, 60 * 60 * 1000), // 3 attempts per hour
  linkPartner
);
router.post(
  '/unlink-partner',
  sensitiveOperationLimit(1, 24 * 60 * 60 * 1000), // 1 attempt per day
  unlinkPartner
);

export default router;
