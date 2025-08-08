import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Camera, Edit3, Plus, X, Link, MapPin, Trash2, Heart, MessageCircle } from 'lucide-react';
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

interface ProfileData {
  fullName: string;
  username: string;
  bio: string;
  website: string;
  location: string;
  avatar: string;
  highlights: Array<{
    id: string;
    title: string;
    coverImage: string;
  }>;
  posts: Post[];
  followers: number;
  following: number;
  postsCount: number;
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    website: '',
    location: '',
    avatar: user?.avatar || '',
    highlights: [
      { id: '1', title: 'RCB', coverImage: '' },
      { id: '2', title: '!!', coverImage: '' },
    ],
    posts: [],
    followers: 378,
    following: 365,
    postsCount: 2
  });

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!user?.username) return;
      
      setLoading(true);
      try {
        const response = await fetch(API_ENDPOINTS.USER_POSTS(user.username));
        if (response.ok) {
          const data = await response.json();
          setProfileData(prev => ({
            ...prev,
            posts: data.posts || [],
            postsCount: data.posts?.length || 0
          }));
        } else {
          console.error('Failed to fetch user posts');
        }
      } catch (error) {
        console.error('Error fetching user posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [user?.username]);

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
        setProfileData(prev => ({
          ...prev,
          posts: prev.posts.filter(post => post._id !== postId),
          postsCount: prev.postsCount - 1
        }));
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
        const { post } = await response.json();
        // Update the post in local state
        setProfileData(prev => ({
          ...prev,
          posts: prev.posts.map(p => p._id === postId ? post : p)
        }));
      } else {
        console.error('Failed to like/unlike post');
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
    }
  };

  const handleEditField = (field: string, value: string) => {
    setEditingField(field);
    setEditValue(value);
  };

  const handleSaveField = async (field: string) => {
    const updatedData = { ...profileData, [field]: editValue };
    setProfileData(updatedData);
    setEditingField(null);
    setEditValue('');

    // Update user in context and backend
    try {
      await updateUser({ [field]: editValue });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);

    try {
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const updatedData = { ...profileData, avatar: result.fileUrl };
        setProfileData(updatedData);
        
        // Update user in context and backend
        await updateUser({ avatar: result.fileUrl });
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  const handleAddHighlight = () => {
    const newHighlight = {
      id: Date.now().toString(),
      title: 'New',
      coverImage: ''
    };
    setProfileData({
      ...profileData,
      highlights: [...profileData.highlights, newHighlight]
    });
  };

  const handleRemoveHighlight = (id: string) => {
    setProfileData({
      ...profileData,
      highlights: profileData.highlights.filter(h => h.id !== id)
    });
  };

  const handleHighlightUpload = async (highlightId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('media', file);

    try {
      const response = await fetch(API_ENDPOINTS.UPLOAD, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setProfileData({
          ...profileData,
          highlights: profileData.highlights.map(h => 
            h.id === highlightId ? { ...h, coverImage: result.fileUrl } : h
          )
        });
      }
    } catch (error) {
      console.error('Error uploading highlight image:', error);
    }
  };

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-info">
          <div className="profile-picture-section">
            <div className="profile-picture">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt="Profile" />
              ) : (
                <div className="profile-picture-placeholder">
                  <User size={48} />
                </div>
              )}
              <button 
                className="upload-profile-picture"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-username-section">
              <h2 className="profile-username">{profileData.username}</h2>
              <div className="profile-actions">
                <button 
                  className="edit-profile-btn"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  Edit profile
                </button>
                <button className="view-archive-btn">View archive</button>
                <button className="settings-btn">
                  <User size={20} />
                </button>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat">
                <span className="stat-number">{profileData.postsCount}</span>
                <span className="stat-label">posts</span>
              </div>
              <div className="stat">
                <span className="stat-number">{profileData.followers}</span>
                <span className="stat-label">followers</span>
              </div>
              <div className="stat">
                <span className="stat-number">{profileData.following}</span>
                <span className="stat-label">following</span>
              </div>
            </div>

            <div className="profile-bio">
              <div className="bio-name">{profileData.fullName}</div>
              <div className="bio-username">@{profileData.username}</div>
              
              {editingField === 'bio' ? (
                <div className="edit-bio">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Write a bio..."
                    rows={3}
                  />
                  <div className="edit-actions">
                    <button onClick={() => handleSaveField('bio')}>Save</button>
                    <button onClick={() => setEditingField(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="bio-text">
                  {profileData.bio || (
                    <span className="add-bio" onClick={() => handleEditField('bio', profileData.bio)}>
                      Add a bio
                    </span>
                  )}
                  {profileData.bio && (
                    <button 
                      className="edit-bio-btn"
                      onClick={() => handleEditField('bio', profileData.bio)}
                    >
                      <Edit3 size={14} />
                    </button>
                  )}
                </div>
              )}

              {editingField === 'website' ? (
                <div className="edit-website">
                  <input
                    type="url"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Add website"
                  />
                  <div className="edit-actions">
                    <button onClick={() => handleSaveField('website')}>Save</button>
                    <button onClick={() => setEditingField(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="bio-website">
                  {profileData.website ? (
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer">
                      <Link size={14} />
                      {profileData.website}
                    </a>
                  ) : (
                    <span className="add-website" onClick={() => handleEditField('website', profileData.website)}>
                      Add website
                    </span>
                  )}
                </div>
              )}

              {editingField === 'location' ? (
                <div className="edit-location">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="Add location"
                  />
                  <div className="edit-actions">
                    <button onClick={() => handleSaveField('location')}>Save</button>
                    <button onClick={() => setEditingField(null)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="bio-location">
                  {profileData.location ? (
                    <span>
                      <MapPin size={14} />
                      {profileData.location}
                    </span>
                  ) : (
                    <span className="add-location" onClick={() => handleEditField('location', profileData.location)}>
                      Add location
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="highlights-section">
        <div className="highlights-container">
          {profileData.highlights.map((highlight) => (
            <div key={highlight.id} className="highlight-item">
              <div className="highlight-cover">
                {highlight.coverImage ? (
                  <img src={highlight.coverImage} alt={highlight.title} />
                ) : (
                  <div className="highlight-placeholder">
                    <Plus size={24} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleHighlightUpload(highlight.id, e)}
                  style={{ display: 'none' }}
                  id={`highlight-${highlight.id}`}
                />
                <label htmlFor={`highlight-${highlight.id}`} className="highlight-upload-label">
                  <Camera size={16} />
                </label>
                {highlight.title !== 'New' && (
                  <button 
                    className="remove-highlight"
                    onClick={() => handleRemoveHighlight(highlight.id)}
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
              <span className="highlight-title">{highlight.title}</span>
            </div>
          ))}
          
          <div className="highlight-item add-highlight" onClick={handleAddHighlight}>
            <div className="highlight-cover">
              <Plus size={24} />
            </div>
            <span className="highlight-title">New</span>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="content-tabs">
        <button className="tab-button active">
          <div className="tab-icon">
            <div className="grid-icon"></div>
          </div>
          <span>POSTS</span>
        </button>
        <button className="tab-button">
          <div className="tab-icon">
            <div className="reels-icon"></div>
          </div>
          <span>REELS</span>
        </button>
        <button className="tab-button">
          <div className="tab-icon">
            <div className="saved-icon"></div>
          </div>
          <span>SAVED</span>
        </button>
      </div>

      {/* Posts Grid */}
      <div className="posts-grid">
        {loading ? (
          <div className="no-posts">
            <div className="no-posts-icon">
              <Camera size={48} />
            </div>
            <h3>Loading posts...</h3>
          </div>
                 ) : profileData.posts.length > 0 ? (
           profileData.posts.map((post) => (
             <div 
               key={post._id} 
               className="post-item" 
               data-media-type={post.mediaType}
               style={{ position: 'relative' }}
             >
               {post.mediaType === 'image' ? (
                 <img src={post.mediaUrl} alt={post.caption || 'Post'} />
               ) : (
                 <video src={post.mediaUrl} muted />
               )}
               
               {/* Post overlay with like count and delete button */}
               <div 
                 className="post-overlay"
                 style={{
                   position: 'absolute',
                   top: 0,
                   left: 0,
                   right: 0,
                   bottom: 0,
                   background: 'rgba(0, 0, 0, 0.3)',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   opacity: 0,
                   transition: 'opacity 0.2s',
                   color: '#fafafa'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.opacity = '1';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.opacity = '0';
                 }}
               >
                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <Heart size={20} fill="#FFD700" />
                     <span style={{ fontSize: '16px', fontWeight: '600' }}>
                       {post.likes.length}
                     </span>
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                     <MessageCircle size={20} />
                     <span style={{ fontSize: '16px', fontWeight: '600' }}>
                       {post.comments.length}
                     </span>
                   </div>
                 </div>
                 
                 {/* Delete button for user's own posts */}
                 {user && post.user._id === user._id && (
                   <button
                     className="post-delete-overlay"
                     onClick={(e) => {
                       e.stopPropagation();
                       handleDeletePost(post._id);
                     }}
                     style={{
                       position: 'absolute',
                       top: '8px',
                       right: '8px',
                       background: 'rgba(0, 0, 0, 0.7)',
                       border: 'none',
                       borderRadius: '50%',
                       width: '32px',
                       height: '32px',
                       display: 'flex',
                       alignItems: 'center',
                       justifyContent: 'center',
                       cursor: 'pointer',
                       color: '#ed4956'
                     }}
                   >
                     <Trash2 size={16} />
                   </button>
                 )}
               </div>
             </div>
           ))
        ) : (
          <div className="no-posts">
            <div className="no-posts-icon">
              <Camera size={48} />
            </div>
            <h3>No Posts Yet</h3>
            <p>When you share photos and videos, they'll appear on your profile.</p>
            <button className="share-first-post">Share your first photo</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
