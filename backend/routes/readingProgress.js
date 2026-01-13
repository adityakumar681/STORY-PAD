import express from 'express';

import {
  updateReadingProgress,
  getReadingProgress,
  getUserReadingProgress,
  getReadingStats
} from '../controllers/readingProgressController.js';

import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/:storyId', auth, updateReadingProgress);
router.get('/:storyId', auth, getReadingProgress);
router.get('/user/progress', auth, getUserReadingProgress);
router.get('/user/stats', auth, getReadingStats);

export default router;
