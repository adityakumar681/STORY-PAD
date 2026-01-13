import Notification from '../models/Notification.js';
import { io } from '../server.js';

export const createNotification = async (data) => {
  try {
    const notification = new Notification(data);
    await notification.save();

    // Populate the notification with sender details
    await notification.populate('sender', 'username profilePicture');
    await notification.populate('story', 'title');
    await notification.populate('chapter', 'title');

    // Emit real-time notification
    io.to(`user_${data.recipient}`).emit('newnotification', notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, filter = 'all' } = req.query;

    let query = { recipient: req.userId };

    if (filter === 'unread') {
      query.read = false;
    } else if (filter === 'read') {
      query.read = true;
    }

    const notifications = await Notification.find(query)
      .populate('sender', 'username profilePicture')
      .populate('story', 'title')
      .populate('chapter', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const totalCount = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.userId,
      read: false,
    });

    res.json({
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        unreadCount,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error marking notifications as read' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.notificationId,
      recipient: req.userId,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting notification' });
  }
};





