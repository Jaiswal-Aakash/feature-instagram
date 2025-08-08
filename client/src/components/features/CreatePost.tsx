import React, { useState, useRef } from 'react';
import { X, Image, Video, Smile, MapPin, Users, Upload, Trash2 } from 'lucide-react';
import ProfileAvatar from '../ProfileAvatar';
import { useAuth } from '../../contexts/AuthContext';

interface CreatePostProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ isOpen, onClose }) => {
  const { refreshToken } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  const emojis = ['😀', '😂', '❤️', '🔥', '👍', '🎉', '😍', '🤔', '😎', '🥳', '😢', '😡', '🤯', '💯', '✨', '🌟', '💪', '🙏', '👏', '🎯'];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      }
    }
  };

  const handleEmojiClick = (emoji: string) => {
    if (captionRef.current) {
      const start = captionRef.current.selectionStart;
      const end = captionRef.current.selectionEnd;
      const newCaption = caption.substring(0, start) + emoji + caption.substring(end);
      setCaption(newCaption);
      
      // Set cursor position after emoji
      setTimeout(() => {
        if (captionRef.current) {
          captionRef.current.selectionStart = captionRef.current.selectionEnd = start + emoji.length;
          captionRef.current.focus();
        }
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const handlePost = async () => {
    if (selectedFile && !isUploading) {
      setIsUploading(true);
      let uploadedMedia = null;
      
      try {
        // First upload the media to Cloudinary
        const formData = new FormData();
        formData.append('media', selectedFile);
        formData.append('caption', caption);

        const uploadResponse = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          console.log('Media uploaded successfully:', uploadResult);
          uploadedMedia = uploadResult; // Store for cleanup if needed
          
          // Now create the post in the database
          const token = localStorage.getItem('authToken');
          if (!token) {
            throw new Error('No authentication token');
          }

          const postData = {
            caption: caption,
            mediaUrl: uploadResult.fileUrl,
            mediaType: selectedFile.type.startsWith('image/') ? 'image' : 'video',
            location: '', // Can be added later
            tags: [] // Can be extracted from caption later
          };

          const postResponse = await fetch('http://localhost:5000/api/posts', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
          });

          if (postResponse.ok) {
            const postResult = await postResponse.json();
            console.log('Post created successfully:', postResult);
            
            // Reset form
            setSelectedFile(null);
            setCaption('');
            setPreviewUrl('');
            setShowEmojiPicker(false);
            onClose();
            
            // Optionally refresh the feed or show success message
            alert('Post created successfully!');
          } else if (postResponse.status === 401) {
            // Token expired, try to refresh
            const refreshSuccess = await refreshToken();
            if (refreshSuccess) {
              // Retry the post creation with new token
              const newToken = localStorage.getItem('authToken');
              const retryResponse = await fetch('http://localhost:5000/api/posts', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${newToken}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(postData)
              });

              if (retryResponse.ok) {
                const postResult = await retryResponse.json();
                console.log('Post created successfully after token refresh:', postResult);
                
                // Reset form
                setSelectedFile(null);
                setCaption('');
                setPreviewUrl('');
                setShowEmojiPicker(false);
                onClose();
                
                alert('Post created successfully!');
              } else {
                // Retry failed - cleanup the uploaded media
                if (uploadedMedia && uploadedMedia.publicId) {
                  try {
                    await fetch('http://localhost:5000/api/upload/delete', {
                      method: 'DELETE',
                      headers: {
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ publicId: uploadedMedia.publicId })
                    });
                    console.log('Cleaned up uploaded media from Cloudinary');
                  } catch (cleanupError) {
                    console.error('Failed to cleanup media:', cleanupError);
                  }
                }
                
                const postError = await retryResponse.json();
                console.error('Post creation failed after token refresh:', postError);
                alert('Failed to create post. Please try again.');
              }
            } else {
              // Token refresh failed - cleanup the uploaded media
              if (uploadedMedia && uploadedMedia.publicId) {
                try {
                  await fetch('http://localhost:5000/api/upload/delete', {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ publicId: uploadedMedia.publicId })
                  });
                  console.log('Cleaned up uploaded media from Cloudinary');
                } catch (cleanupError) {
                  console.error('Failed to cleanup media:', cleanupError);
                }
              }
              
              alert('Session expired. Please log in again.');
            }
          } else {
            // Post creation failed - cleanup the uploaded media
            if (uploadedMedia && uploadedMedia.publicId) {
              try {
                await fetch('http://localhost:5000/api/upload/delete', {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ publicId: uploadedMedia.publicId })
                });
                console.log('Cleaned up uploaded media from Cloudinary');
              } catch (cleanupError) {
                console.error('Failed to cleanup media:', cleanupError);
              }
            }
            
            const postError = await postResponse.json();
            console.error('Post creation failed:', postError);
            alert('Failed to create post. Please try again.');
          }
        } else {
          const error = await uploadResponse.json();
          console.error('Upload failed:', error);
          alert('Failed to upload media. Please try again.');
        }
      } catch (error) {
        // If any error occurs and we have uploaded media, cleanup
        if (uploadedMedia && uploadedMedia.publicId) {
          try {
            await fetch('http://localhost:5000/api/upload/delete', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ publicId: uploadedMedia.publicId })
            });
            console.log('Cleaned up uploaded media from Cloudinary after error');
          } catch (cleanupError) {
            console.error('Failed to cleanup media:', cleanupError);
          }
        }
        
        console.error('Post creation error:', error);
        alert('Failed to create post. Please try again.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-post-overlay">
      <div className="create-post-modal">
        <div className="create-post-header">
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
          <h2>Create new post</h2>
          <button 
            className={`share-btn ${selectedFile && !isUploading ? 'active' : 'disabled'}`}
            onClick={handlePost}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Sharing...' : 'Share'}
          </button>
        </div>

        <div className="create-post-content">
          <div className="upload-section">
            {!previewUrl ? (
              <div 
                className={`upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="upload-icons">
                  <Image size={48} />
                  <Video size={48} />
                </div>
                <p>Drag photos and videos here</p>
                <button 
                  className="select-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} />
                  Select from computer
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            ) : (
              <div className="preview-section">
                {selectedFile?.type.startsWith('video/') ? (
                  <video src={previewUrl} controls className="preview-video" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                )}
                <div className="preview-actions">
                  <button className="change-btn" onClick={() => fileInputRef.current?.click()}>
                    Change
                  </button>
                  <button className="remove-btn" onClick={handleRemoveFile}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="caption-section">
            <div className="user-info">
              <ProfileAvatar 
                firstName="Akash" 
                lastName="Jaiswal" 
                size={32}
                className="user-avatar"
              />
              <span className="username">akashjaiswal0706</span>
            </div>
            
            <div className="caption-container">
              <textarea
                ref={captionRef}
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="caption-input"
                rows={4}
              />
              
              {showEmojiPicker && (
                <div className="emoji-picker">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      className="emoji-btn"
                      onClick={() => handleEmojiClick(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="post-options">
              <button 
                className="option-btn"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={20} />
                <span>Add emoji</span>
              </button>
              <button className="option-btn">
                <MapPin size={20} />
                <span>Add location</span>
              </button>
              <button className="option-btn">
                <Users size={20} />
                <span>Tag people</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
