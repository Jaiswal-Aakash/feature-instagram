import React from 'react';
import { Heart, MessageCircle, User, UserPlus, X } from 'lucide-react';
import ProfileAvatar from './ProfileAvatar';

interface NotificationItemProps {
  notification: {
    _id: string;
    type: 'comment' | 'like' | 'follow' | 'mention';
    message: string;
    read: boolean;
    createdAt: string;
    sender: {
      _id: string;
      username: string;
      fullName: string;
      avatar?: string;
    };
    post?: {
      _id: string;
      caption: string;
      mediaUrl: string;
    };
    comment?: {
      _id: string;
      text: string;
    };
  };
  onMarkAsRead: (notificationId: string) => void;
  onDelete: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete
}) => {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'comment':
        return <MessageCircle size={16} color="#fafafa" />;
      case 'like':
        return <Heart size={16} color="#fafafa" />;
      case 'follow':
        return <UserPlus size={16} color="#fafafa" />;
      case 'mention':
        return <User size={16} color="#fafafa" />;
      default:
        return <MessageCircle size={16} color="#fafafa" />;
    }
  };

  const getNotificationColor = () => {
    switch (notification.type) {
      case 'comment':
        return '#0095f6';
      case 'like':
        return '#ed4956';
      case 'follow':
        return '#00c851';
      case 'mention':
        return '#ff9800';
      default:
        return '#0095f6';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  return (
    <div 
      className={`notification-item ${!notification.read ? 'unread' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        padding: '16px 20px',
        borderBottom: '1px solid #262626',
        backgroundColor: notification.read ? 'transparent' : 'rgba(0, 149, 246, 0.08)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
      onClick={() => onMarkAsRead(notification._id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = notification.read 
          ? 'rgba(255, 255, 255, 0.02)' 
          : 'rgba(0, 149, 246, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = notification.read 
          ? 'transparent' 
          : 'rgba(0, 149, 246, 0.08)';
      }}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div style={{
          position: 'absolute',
          left: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: '#0095f6'
        }} />
      )}

      <div 
        className="notification-icon"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: getNotificationColor(),
          marginRight: '16px',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        {getNotificationIcon()}
      </div>

      <div className="notification-content" style={{ flex: 1, minWidth: 0 }}>
        <div className="notification-header" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginBottom: '6px',
          flexWrap: 'wrap'
        }}>
          {notification.sender.avatar ? (
            <img 
              src={notification.sender.avatar} 
              alt={notification.sender.fullName}
              style={{ 
                width: '24px', 
                height: '24px', 
                borderRadius: '50%',
                border: '1px solid #262626'
              }}
            />
          ) : (
            <ProfileAvatar 
              firstName={notification.sender.fullName.split(' ')[0]} 
              lastName={notification.sender.fullName.split(' ').slice(1).join(' ')} 
              size={24}
            />
          )}
          <span style={{ 
            fontWeight: '600', 
            fontSize: '14px', 
            color: '#fafafa',
            cursor: 'pointer'
          }}>
            {notification.sender.username}
          </span>
          <span style={{ 
            fontSize: '12px', 
            color: '#8e8e8e',
            fontWeight: '400'
          }}>
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>

        <div className="notification-message" style={{ 
          fontSize: '14px', 
          color: '#fafafa', 
          marginBottom: '8px',
          lineHeight: '1.4'
        }}>
          {notification.message}
        </div>

        {notification.post && (
          <div className="notification-post-preview" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginTop: '8px'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '4px',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid #262626'
            }}>
              <img 
                src={notification.post.mediaUrl} 
                alt={notification.post.caption || 'Post'} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover'
                }}
              />
            </div>
            <span style={{ 
              fontSize: '13px', 
              color: '#8e8e8e', 
              flex: 1, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis', 
              whiteSpace: 'nowrap',
              lineHeight: '1.3'
            }}>
              {notification.post.caption || 'Post'}
            </span>
          </div>
        )}

        {notification.comment && (
          <div className="notification-comment-preview" style={{ 
            fontSize: '13px', 
            color: '#8e8e8e', 
            fontStyle: 'italic',
            marginTop: '6px',
            padding: '8px 12px',
            backgroundColor: '#1a1a1a',
            borderRadius: '8px',
            border: '1px solid #262626',
            lineHeight: '1.4'
          }}>
            "{notification.comment.text}"
          </div>
        )}
      </div>

      <button
        className="notification-delete-btn"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification._id);
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#8e8e8e',
          cursor: 'pointer',
          padding: '8px',
          marginLeft: '8px',
          borderRadius: '50%',
          opacity: 0,
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px'
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.color = '#ed4956';
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.opacity = '0';
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#8e8e8e';
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default NotificationItem;
