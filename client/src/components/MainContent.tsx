import React, { useState, useEffect } from 'react';
import Reels from './features/Reels';
import ProfileAvatar from './ProfileAvatar';
import Profile from './Profile';
import Notifications from './Notifications';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Trash2, Smile } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EmojiPicker from 'emoji-picker-react';
import { API_ENDPOINTS } from '../config/api';

interface Post {
  _id: string;
  user: {
    _id: string;
    username: string;
    fullName: string;
    avatar?: string;
  };
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  likes: Array<string | { _id: string; username: string; fullName: string; avatar?: string }>;
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      username: string;
      fullName: string;
      avatar?: string;
    };
    text: string;
    createdAt: string;
  }>;
  createdAt: string;
}

interface MainContentProps {
  activeSection: string;
}

const MainContent: React.FC<MainContentProps> = ({ activeSection }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteMenu, setShowDeleteMenu] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [postId: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [postId: string]: boolean }>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState<{ [postId: string]: boolean }>({});
  const [activeCommentInput, setActiveCommentInput] = useState<string | null>(null);

  // Fetch posts from database
  useEffect(() => {
    const fetchPosts = async () => {
      if (activeSection === 'home') {
        setLoading(true);
        try {
          const response = await fetch(API_ENDPOINTS.POSTS);
          if (response.ok) {
            const data = await response.json();
            setPosts(data.posts || []);
          } else {
            console.error('Failed to fetch posts');
          }
        } catch (error) {
          console.error('Error fetching posts:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPosts();
  }, [activeSection]);

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.POST_BY_ID(postId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove the post from the local state
        setPosts(posts.filter(post => post._id !== postId));
        setShowDeleteMenu(null); // Close menu after deletion
        alert('Post deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete post: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.POST_LIKE(postId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const { post, isLiked } = await response.json();
        console.log('Like response:', { post, isLiked });
        console.log('Updated post likes:', post.likes);
        console.log('Current user ID:', user?._id);
        // Update the post in local state with the new like status
        setPosts(posts.map(p => p._id === postId ? post : p));
      } else {
        console.error('Failed to like/unlike post');
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const handleAddComment = async (postId: string, commentText: string) => {
    if (!user || !commentText.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(API_ENDPOINTS.POST_COMMENTS(postId), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText.trim() })
      });

      if (response.ok) {
        const { post } = await response.json();
        // Update the post in local state
        setPosts(posts.map(p => p._id === postId ? post : p));
      } else {
        console.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEmojiClick = (postId: string, emojiObject: any) => {
    const currentText = commentInputs[postId] || '';
    setCommentInputs(prev => ({ ...prev, [postId]: currentText + emojiObject.emoji }));
    setShowEmojiPicker(prev => ({ ...prev, [postId]: false }));
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.post-header-actions')) {
        setShowDeleteMenu(null);
      }
      if (!target.closest('.comment-input-container')) {
        setShowEmojiPicker({});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const stories = [
    { username: 'thisisvalena', firstName: 'Valena', lastName: 'Smith' },
    { username: 'mohamm...', firstName: 'Mohammed', lastName: 'Ali' },
    { username: 'yoyohone...', firstName: 'Yoyo', lastName: 'Honey' },
    { username: 'steel.fss', firstName: 'Steel', lastName: 'FSS' },
    { username: 'anuj_3409', firstName: 'Anuj', lastName: 'Kumar' },
    { username: 'dead_mod...', firstName: 'Dead', lastName: 'Mod' },
  ];

  const renderHomeContent = () => (
    <>
      <div className="stories-section">
        <div className="stories-container">
          {stories.map((story, index) => (
            <div key={index} className="story-item">
              <div className="story-avatar">
                <ProfileAvatar 
                  firstName={story.firstName} 
                  lastName={story.lastName} 
                  size={64}
                />
              </div>
              <span className="story-username">{story.username}</span>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="feed-post">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            Loading posts...
          </div>
        </div>
      ) : posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id} className="feed-post">
            <div className="post-header">
              <div className="post-user-info">
                {post.user.avatar ? (
                  <img 
                    src={post.user.avatar} 
                    alt={post.user.fullName}
                    className="user-avatar"
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                ) : (
                  <ProfileAvatar 
                    firstName={post.user.fullName.split(' ')[0]} 
                    lastName={post.user.fullName.split(' ').slice(1).join(' ')} 
                    size={32}
                    className="user-avatar"
                  />
                )}
                <span className="username">{post.user.username}</span>
              </div>
                             <div className="post-header-actions" style={{ position: 'relative' }}>
                 <button 
                   className="post-more-btn"
                   onClick={() => setShowDeleteMenu(showDeleteMenu === post._id ? null : post._id)}
                 >
                   <MoreHorizontal size={20} />
                 </button>
                 
                 {showDeleteMenu === post._id && (
                   <div 
                     className="post-menu-dropdown"
                     style={{
                       position: 'absolute',
                       top: '100%',
                       right: '0',
                       backgroundColor: '#262626',
                       borderRadius: '8px',
                       boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                       zIndex: 1000,
                       minWidth: '200px',
                       border: '1px solid #363636'
                     }}
                   >
                     {user && post.user._id === user._id && (
                       <button
                         className="menu-item delete-item"
                         onClick={() => handleDeletePost(post._id)}
                         style={{
                           width: '100%',
                           padding: '12px 16px',
                           background: 'none',
                           border: 'none',
                           color: '#ed4956',
                           cursor: 'pointer',
                           textAlign: 'left',
                           fontSize: '14px',
                           fontWeight: '500',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '8px',
                           borderBottom: '1px solid #363636'
                         }}
                       >
                         <Trash2 size={16} />
                         Delete
                       </button>
                     )}
                     <button
                       className="menu-item"
                       style={{
                         width: '100%',
                         padding: '12px 16px',
                         background: 'none',
                         border: 'none',
                         color: '#fafafa',
                         cursor: 'pointer',
                         textAlign: 'left',
                         fontSize: '14px',
                         fontWeight: '500',
                         display: 'flex',
                         alignItems: 'center',
                         gap: '8px'
                       }}
                     >
                       Report
                     </button>
                   </div>
                 )}
               </div>
            </div>
            
            <div className="post-content">
              {post.mediaType === 'image' ? (
                <img 
                  src={post.mediaUrl} 
                  alt={post.caption || 'Post image'} 
                  style={{ width: '100%', height: 'auto' }}
                />
              ) : (
                <video 
                  src={post.mediaUrl} 
                  controls 
                  style={{ width: '100%', height: 'auto' }}
                />
              )}
            </div>
            
            {post.caption && (
              <div style={{ padding: '12px 16px', fontSize: '14px' }}>
                <strong>{post.user.username}</strong> {post.caption}
              </div>
            )}
            
            <div className="post-actions">
              <div className="action-buttons">
                                 <button 
                   className="action-btn"
                   onClick={() => handleLikePost(post._id)}
                   style={{
                     color: post.likes.some(like => (typeof like === 'string' ? like === user?._id : like._id === user?._id)) ? '#FFD700' : '#fafafa'
                   }}
                 >
                   <Heart 
                     size={24} 
                     fill={post.likes.some(like => (typeof like === 'string' ? like === user?._id : like._id === user?._id)) ? '#FFD700' : 'none'}
                     style={{
                       transition: 'fill 0.2s ease'
                     }}
                   />
                 </button>
                <button 
                  className="action-btn"
                  onClick={() => setShowComments(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                >
                  <MessageCircle size={24} />
                </button>
                <button className="action-btn">
                  <Send size={24} />
                </button>
                <button className="action-btn">
                  <Bookmark size={24} />
                </button>
              </div>
              <div style={{ padding: '0 16px 12px', fontSize: '14px', color: '#8e8e8e' }}>
                {post.likes.length} likes
                {post.comments.length > 0 && !showComments[post._id] && (
                  <span 
                    style={{ cursor: 'pointer', marginLeft: '8px' }}
                    onClick={() => setShowComments(prev => ({ ...prev, [post._id]: true }))}
                  >
                    View all {post.comments.length} comments
                  </span>
                )}
              </div>
              
              {/* Comments Section */}
              {showComments[post._id] && (
                <div className="comments-section" style={{ padding: '0 16px 16px' }}>
                  {/* Display existing comments */}
                  {post.comments.length > 0 && (
                    <div className="comments-list" style={{ marginBottom: '12px' }}>
                      {post.comments.slice(0, 3).map((comment, index) => (
                        <div key={comment._id} className="comment-item" style={{ marginBottom: '4px' }}>
                          <span style={{ fontWeight: '600', fontSize: '14px' }}>
                            {comment.user.username}
                          </span>
                          <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                            {comment.text}
                          </span>
                        </div>
                      ))}
                      {post.comments.length > 3 && (
                        <div style={{ fontSize: '14px', color: '#8e8e8e', cursor: 'pointer' }}>
                          View all {post.comments.length} comments
                        </div>
                      )}
                    </div>
                  )}
                  
                                     {/* Comment input */}
                   <div className="comment-input-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                     <button
                       onClick={() => setShowEmojiPicker(prev => ({ ...prev, [post._id]: !prev[post._id] }))}
                       style={{
                         background: 'none',
                         border: 'none',
                         color: '#8e8e8e',
                         cursor: 'pointer',
                         padding: '4px',
                         display: 'flex',
                         alignItems: 'center'
                       }}
                     >
                       <Smile size={20} />
                     </button>
                     
                     {showEmojiPicker[post._id] && (
                       <div style={{
                         position: 'absolute',
                         bottom: '100%',
                         left: '0',
                         zIndex: 1000,
                         marginBottom: '8px'
                       }}>
                         <EmojiPicker
                           onEmojiClick={(emojiObject) => handleEmojiClick(post._id, emojiObject)}
                           width={300}
                           height={400}
                         />
                       </div>
                     )}
                     
                     <input
                       type="text"
                       placeholder="Add a comment..."
                       value={commentInputs[post._id] || ''}
                       onChange={(e) => setCommentInputs(prev => ({ ...prev, [post._id]: e.target.value }))}
                       onKeyPress={(e) => {
                         if (e.key === 'Enter') {
                           handleAddComment(post._id, commentInputs[post._id] || '');
                           setCommentInputs(prev => ({ ...prev, [post._id]: '' }));
                         }
                       }}
                       style={{
                         flex: 1,
                         border: 'none',
                         outline: 'none',
                         background: 'transparent',
                         color: '#fafafa',
                         fontSize: '14px',
                         padding: '8px 0'
                       }}
                     />
                     <button
                       onClick={() => {
                         handleAddComment(post._id, commentInputs[post._id] || '');
                         setCommentInputs(prev => ({ ...prev, [post._id]: '' }));
                       }}
                       disabled={!commentInputs[post._id]?.trim()}
                       style={{
                         background: 'none',
                         border: 'none',
                         color: commentInputs[post._id]?.trim() ? '#0095f6' : '#8e8e8e',
                         cursor: commentInputs[post._id]?.trim() ? 'pointer' : 'default',
                         fontSize: '14px',
                         fontWeight: '600'
                       }}
                     >
                       Post
                     </button>
                   </div>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="feed-post">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h3>No posts yet</h3>
            <p>When users create posts, they'll appear here.</p>
          </div>
        </div>
      )}
    </>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'home':
        return renderHomeContent();
      case 'reels':
        return <Reels />;
      case 'search':
        return <div className="section-placeholder">Search Section</div>;
      case 'explore':
        return <div className="section-placeholder">Explore Section</div>;
      case 'messages':
        return <div className="section-placeholder">Messages Section</div>;
      case 'notifications':
        return <Notifications />;
      case 'dashboard':
        return <div className="section-placeholder">Dashboard Section</div>;
      case 'profile':
        return <Profile />;
      case 'more':
        return <div className="section-placeholder">More Section</div>;
      default:
        return renderHomeContent();
    }
  };

  return (
    <div className="main-content">
      {renderSectionContent()}
    </div>
  );
};

export default MainContent;
