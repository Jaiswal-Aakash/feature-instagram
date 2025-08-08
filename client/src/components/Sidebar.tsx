import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Search, 
  Compass, 
  Play, 
  MessageCircle, 
  Heart, 
  PlusSquare, 
  BarChart3, 
  User, 
  Menu 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCreatePost: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, onCreatePost }) => {
  const { user } = useAuth();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const fetchUnreadNotifications = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/notifications?page=1&limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadNotifications(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  useEffect(() => {
    fetchUnreadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchUnreadNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleNavClick = (section: string) => {
    if (section === 'create') {
      onCreatePost();
    } else {
      onSectionChange(section);
    }
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1 className="instagram-logo">Instagram</h1>
        </div>
        
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            <Home size={24} />
            <span>Home</span>
          </div>
          
          <div 
            className={`nav-item ${activeSection === 'search' ? 'active' : ''}`}
            onClick={() => handleNavClick('search')}
          >
            <Search size={24} />
            <span>Search</span>
          </div>
          
          <div 
            className={`nav-item ${activeSection === 'explore' ? 'active' : ''}`}
            onClick={() => handleNavClick('explore')}
          >
            <Compass size={24} />
            <span>Explore</span>
          </div>
          
          <div 
            className={`nav-item ${activeSection === 'reels' ? 'active' : ''}`}
            onClick={() => handleNavClick('reels')}
          >
            <Play size={24} />
            <span>Reels</span>
          </div>
          
          <div 
            className={`nav-item ${activeSection === 'messages' ? 'active' : ''}`}
            onClick={() => handleNavClick('messages')}
          >
            <div className="nav-item-with-badge">
              <MessageCircle size={24} />
              <span>Messages</span>
              <div className="badge">6</div>
            </div>
          </div>
          
          <div 
            className={`nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => handleNavClick('notifications')}
          >
            <div className="nav-item-with-badge">
              <Heart size={24} />
              <span>Notifications</span>
              {unreadNotifications > 0 && (
                <div className="badge" style={{
                  backgroundColor: '#ed4956',
                  color: '#fff',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: '600',
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px'
                }}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </div>
              )}
            </div>
          </div>
          
          <div 
            className="nav-item"
            onClick={() => handleNavClick('create')}
          >
            <PlusSquare size={24} />
            <span>Create</span>
          </div>
          
          <div 
            className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <BarChart3 size={24} />
            <span>Dashboard</span>
          </div>
          
          <div 
            className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => handleNavClick('profile')}
          >
            <User size={24} />
            <span>Profile</span>
          </div>
          
          <div 
            className={`nav-item ${activeSection === 'more' ? 'active' : ''}`}
            onClick={() => handleNavClick('more')}
          >
            <Menu size={24} />
            <span>More</span>
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="bottom-nav">
        <div className="bottom-nav-container">
          <div 
            className={`bottom-nav-item ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            <Home size={24} />
            <span>Home</span>
          </div>
          
          <div 
            className={`bottom-nav-item ${activeSection === 'search' ? 'active' : ''}`}
            onClick={() => handleNavClick('search')}
          >
            <Search size={24} />
            <span>Search</span>
          </div>
          
          <div 
            className={`bottom-nav-item ${activeSection === 'explore' ? 'active' : ''}`}
            onClick={() => handleNavClick('explore')}
          >
            <Compass size={24} />
            <span>Explore</span>
          </div>
          
          <div 
            className={`bottom-nav-item ${activeSection === 'reels' ? 'active' : ''}`}
            onClick={() => handleNavClick('reels')}
          >
            <Play size={24} />
            <span>Reels</span>
          </div>
          
          <div 
            className={`bottom-nav-item-with-badge ${activeSection === 'notifications' ? 'active' : ''}`}
            onClick={() => handleNavClick('notifications')}
          >
            <Heart size={24} />
            <span>Notifications</span>
            {unreadNotifications > 0 && (
              <div className="bottom-nav-badge">
                {unreadNotifications > 99 ? '99+' : unreadNotifications}
              </div>
            )}
          </div>
          
          <div 
            className={`bottom-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => handleNavClick('profile')}
          >
            <User size={24} />
            <span>Profile</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
