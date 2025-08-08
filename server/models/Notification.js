const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['comment', 'like', 'follow', 'mention'],
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: function() {
      return this.type === 'comment' || this.type === 'like';
    }
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  read: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient querying
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

// Pre-save middleware to limit notifications to 30 per user
notificationSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments({ recipient: this.recipient });
    if (count >= 30) {
      // Remove oldest notification
      const oldestNotification = await this.constructor
        .findOne({ recipient: this.recipient })
        .sort({ createdAt: 1 });
      
      if (oldestNotification) {
        await oldestNotification.remove();
      }
    }
  }
  next();
});

module.exports = mongoose.model('Notification', notificationSchema);
