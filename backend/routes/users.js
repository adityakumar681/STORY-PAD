import express from 'express';
import { 
  getProfile, 
  getFollowing,
  followUser, 
  updateProfile, 
  updatePassword, 
  uploadAvatar,
  removeAvatar,
  updatePreferences,
  deleteAccount,
  getUserStories,
  searchUsers 
} from '../controllers/userController.js';
import auth from '../middleware/auth.js';
import upload from '../config/cloudinary.js';

const router = express.Router();

router.get('/search', searchUsers);
router.get('/following', auth, getFollowing);
router.get('/:userId', getProfile);
router.get('/:userId/stories', getUserStories);
router.post('/:userId/follow', auth, followUser);
router.put('/profile', auth, updateProfile);
router.put('/password', auth, updatePassword);
router.post('/upload-avatar', auth, upload.single('profilePicture'), uploadAvatar);
router.delete('/avatar', auth, removeAvatar);
router.put('/preferences', auth, updatePreferences);
router.delete('/account', auth, deleteAccount);

export default router;