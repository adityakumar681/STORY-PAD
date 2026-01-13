import express from 'express';

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from '../controllers/notificationController.js';

import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getNotifications);
router.patch('/:notificationId/read', auth, markNotificationAsRead);
router.patch('/read-all', auth, markAllNotificationsAsRead);
router.delete('/:notificationId', auth, deleteNotification);

export default router;
