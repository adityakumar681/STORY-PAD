import express from 'express';
import { createStory, getStories, getStory, likeStory, updateStory, deleteStory, incrementReads, getMustWatchStories, searchStories } from '../controllers/storyController.js';
import {
  addStoryComment,
  getStoryComments,
  likeStoryComment,
  addCommentReply,
  updateStoryComment,
  deleteStoryComment
} from '../controllers/storyCommentController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, createStory);
router.get('/', getStories);
router.get('/search', searchStories);
router.get('/must-watch', getMustWatchStories);
router.get('/:storyId', getStory);
router.put('/:storyId', auth, updateStory);
router.delete('/:storyId', auth, deleteStory);
router.post('/:storyId/like', auth, likeStory);
router.patch('/:storyId/read', incrementReads);

// Comment routes nested under stories
router.post('/:storyId/comments', auth, addStoryComment);
router.get('/:storyId/comments', getStoryComments);
router.post('/:storyId/comments/:commentId/like', auth, likeStoryComment);
router.post('/:storyId/comments/:commentId/reply', auth, addCommentReply);
router.put('/:storyId/comments/:commentId', auth, updateStoryComment);
router.delete('/:storyId/comments/:commentId', auth, deleteStoryComment);

export default router;