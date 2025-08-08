import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import NotificationItem from './NotificationItem';

interface Notification {
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
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [showMarkAllButton, setShowMarkAllButton] = useState(false);

  const fetchNotifications = async (page = 1) => {
    if (!user) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/notifications?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (page === 1) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        setUnreadCount(data.unreadCount);
        setHasNextPage(data.hasNextPage);
        setCurrentPage(page);
        setShowMarkAllButton(data.unreadCount > 0);
      } else {
        console.error('Failed to fetch notifications');
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        if (unreadCount - 1 === 0) {
          setShowMarkAllButton(false);
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
        setUnreadCount(0);
        setShowMarkAllButton(false);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(n => n._id === notificationId);
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
          if (unreadCount - 1 === 0) {
            setShowMarkAllButton(false);
          }
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const loadMoreNotifications = () => {
    if (hasNextPage && !loading) {
      fetchNotifications(currentPage + 1);
    }
  };

  return (
    <div className="notifications-container" style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      padding: '20px',
      minHeight: '100vh',
      backgroundColor: '#000'
    }}>
      {/* Header */}
      <div className="notifications-header" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '24px',
        padding: '16px 0',
        borderBottom: '1px solid #262626',
        position: 'sticky',
        top: 0,
        backgroundColor: '#000',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#262626',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}>
            <Bell size={20} color="#fafafa" />
          </div>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: '600',
              color: '#fafafa',
              letterSpacing: '-0.5px'
            }}>
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span style={{
                backgroundColor: '#ed4956',
                color: '#fff',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'inline-block',
                marginTop: '4px'
              }}>
                {unreadCount} new
              </span>
            )}
          </div>
        </div>

        {showMarkAllButton && (
          <button
            onClick={handleMarkAllAsRead}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#0095f6',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              padding: '8px 12px',
              borderRadius: '8px',
              transition: 'background-color 0.2s ease',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(0, 149, 246, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Check size={16} />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="notifications-list" style={{ 
        backgroundColor: 'transparent',
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid #262626'
      }}>
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification, index) => (
              <div
                key={notification._id}
                style={{
                  animation: `slideIn 0.3s ease ${index * 0.05}s both`,
                  opacity: 0,
                  transform: 'translateY(10px)',
                  animationFillMode: 'forwards'
                }}
              >
                <NotificationItem
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDeleteNotification}
                />
              </div>
            ))}
            
            {hasNextPage && (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center',
                borderTop: '1px solid #262626'
              }}>
                <button
                  onClick={loadMoreNotifications}
                  disabled={loading}
                  style={{
                    background: 'none',
                    border: '1px solid #363636',
                    color: '#fafafa',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    cursor: loading ? 'default' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.borderColor = '#0095f6';
                      e.currentTarget.style.color = '#0095f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.currentTarget.style.borderColor = '#363636';
                      e.currentTarget.style.color = '#fafafa';
                    }
                  }}
                >
                  {loading ? 'Loading...' : 'Load more'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ 
            padding: '60px 20px', 
            textAlign: 'center', 
            color: '#8e8e8e',
            backgroundColor: '#121212'
          }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: '#262626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <Bell size={32} color="#8e8e8e" />
              </div>
              <h3 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '600',
                color: '#fafafa'
              }}>
                All caught up
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '14px',
                lineHeight: '1.5',
                maxWidth: '300px'
              }}>
                You're all caught up! Check back later for new notifications from people you follow.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
