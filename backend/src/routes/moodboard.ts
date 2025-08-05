import { Router } from 'express';
import {
  getMoodboards,
  getMoodboard,
  createMoodboard,
  updateMoodboard,
  deleteMoodboard,
  uploadMoodboardMedia,
  getMoodSuggestions,
  selectMood,
  initializeDefaultMoodboards,
  fixMoodboardActiveStates,
} from '../controllers/moodboardController';
import {
  validateMoodboard,
  validateMoodboardUpdate,
} from '../middleware/validation';
import { protect } from '../middleware/auth';
import multer from 'multer';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed!'));
    }
  },
});

// All routes require authentication
router.use(protect);

// Mood suggestions route (should be before /:id routes)
router.get('/suggestions', getMoodSuggestions);

// Initialize default moodboards
router.post('/initialize', initializeDefaultMoodboards);

// Fix active states
router.post('/fix-active-states', fixMoodboardActiveStates);

// CRUD routes
router.route('/')
  .get(getMoodboards)
  .post(validateMoodboard, createMoodboard);

router.route('/:id')
  .get(getMoodboard)
  .put(validateMoodboardUpdate, updateMoodboard)
  .delete(deleteMoodboard);

// Select mood route
router.put('/:id/select', selectMood);

// Media upload route
router.post('/:id/upload', upload.single('media'), uploadMoodboardMedia);

export default router;
