import express from 'express';
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

router.post('/:storyId', auth, addStoryComment);
router.get('/:storyId', getStoryComments);
router.post('/comment/:commentId/like', auth, likeStoryComment);
router.post('/comment/:commentId/reply', auth, addCommentReply);
router.put('/comment/:commentId', auth, updateStoryComment);
router.delete('/comment/:commentId', auth, deleteStoryComment);

export default router;