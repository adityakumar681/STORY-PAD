import express from 'express';
import { toggleBookmark, getBookmarks } from '../controllers/bookmarkController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/:storyId', auth, toggleBookmark);
router.get('/', auth, getBookmarks);

export default router;
