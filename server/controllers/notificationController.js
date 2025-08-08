const Notification = require('../models/Notification');
const User = require('../models/User');

// Get user's notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await Notification.find({ recipient: userId })
      .populate('sender', 'username fullName avatar')
      .populate('post', 'caption mediaUrl')
      .populate('comment', 'text')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNotifications = await Notification.countDocuments({ recipient: userId });
    const unreadCount = await Notification.countDocuments({ 
      recipient: userId, 
      read: false 
    });

    res.json({
      notifications,
      currentPage: page,
      totalPages: Math.ceil(totalNotifications / limit),
      hasNextPage: page * limit < totalNotifications,
      hasPrevPage: page > 1,
      unreadCount
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      error: 'Failed to fetch notifications',
      message: 'An error occurred while fetching notifications'
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'Notification does not exist or you do not have permission to access it'
      });
    }

    res.json({
      message: 'Notification marked as read',
      notification
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      error: 'Failed to mark notification as read',
      message: 'An error occurred while marking notification as read'
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipient: userId, read: false },
      { read: true }
    );

    res.json({
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      error: 'Failed to mark all notifications as read',
      message: 'An error occurred while marking all notifications as read'
    });
  }
};

// Create notification (helper function)
const createNotification = async (recipientId, senderId, type, postId = null, commentId = null, message = null) => {
  try {
    let notificationMessage = message;

    if (!notificationMessage) {
      const sender = await User.findById(senderId).select('username fullName');
      
      switch (type) {
        case 'comment':
          notificationMessage = `${sender.username} commented on your post`;
          break;
        case 'like':
          notificationMessage = `${sender.username} liked your post`;
          break;
        case 'follow':
          notificationMessage = `${sender.username} started following you`;
          break;
        case 'mention':
          notificationMessage = `${sender.username} mentioned you in a comment`;
          break;
        default:
          notificationMessage = `${sender.username} interacted with your post`;
      }
    }

    const notification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      post: postId,
      comment: commentId,
      message: notificationMessage
    });

    await notification.save();
    return notification;

  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId
    });

    if (!notification) {
      return res.status(404).json({
        error: 'Notification not found',
        message: 'Notification does not exist or you do not have permission to delete it'
      });
    }

    res.json({
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      error: 'Failed to delete notification',
      message: 'An error occurred while deleting notification'
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification
};
