const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// Get user's notifications
router.get('/', authenticateToken, getNotifications);

// Mark notification as read
router.patch('/:notificationId/read', authenticateToken, markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, markAllAsRead);

// Delete notification
router.delete('/:notificationId', authenticateToken, deleteNotification);

module.exports = router;
