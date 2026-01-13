import express from 'express';

import {
  createChapter,
  getChapters,
  getChapter,
  updateChapter,
  deleteChapter,
  likeChapter,
  addComment
} from '../controllers/chapterController.js';

import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/story/:storyId', auth, createChapter);
router.get('/story/:storyId', getChapters);
router.get('/:chapterId', getChapter);
router.put('/:chapterId', auth, updateChapter);
router.delete('/:chapterId', auth, deleteChapter);
router.post('/:chapterId/like', auth, likeChapter);
router.post('/:chapterId/comment', auth, addComment);

export default router;
