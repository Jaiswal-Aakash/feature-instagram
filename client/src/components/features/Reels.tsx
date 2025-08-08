import React, { useState, useRef, useCallback } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Play, Pause } from 'lucide-react';
import ProfileAvatar from '../ProfileAvatar';

interface Reel {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  videoUrl: string;
  caption: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
}

const Reels: React.FC = () => {
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const reels: Reel[] = [
    {
      id: '1',
      username: 'travel_creator',
      firstName: 'Travel',
      lastName: 'Creator',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
      caption: 'Amazing sunset at the beach! 🌅 #travel #sunset #beach',
      likes: 1247,
      comments: 89,
      isLiked: false,
      isSaved: false
    },
    {
      id: '2',
      username: 'food_lover',
      firstName: 'Food',
      lastName: 'Lover',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4',
      caption: 'Homemade pasta recipe 🍝 #food #cooking #pasta',
      likes: 892,
      comments: 45,
      isLiked: true,
      isSaved: false
    },
    {
      id: '3',
      username: 'fitness_motivation',
      firstName: 'Fitness',
      lastName: 'Motivation',
      videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_5mb.mp4',
      caption: 'Morning workout routine 💪 #fitness #workout #motivation',
      likes: 2156,
      comments: 123,
      isLiked: false,
      isSaved: true
    }
  ];

  const [reelsData, setReelsData] = useState<Reel[]>(reels);

  const handleLike = (reelId: string) => {
    setReelsData(prev => prev.map(reel => 
      reel.id === reelId 
        ? { ...reel, isLiked: !reel.isLiked, likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1 }
        : reel
    ));
  };

  const handleSave = (reelId: string) => {
    setReelsData(prev => prev.map(reel => 
      reel.id === reelId 
        ? { ...reel, isSaved: !reel.isSaved }
        : reel
    ));
  };

  const handleVideoClick = () => {
    const video = videoRefs.current[currentReelIndex];
    if (video) {
      if (isPlaying) {
        video.pause();
        setIsPlaying(false);
      } else {
        video.play();
        setIsPlaying(true);
      }
    }
  };

  const handleScroll = (e: React.WheelEvent) => {
    e.preventDefault();
    const direction = e.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(reelsData.length - 1, currentReelIndex + direction));
    setCurrentReelIndex(newIndex);
    setIsPlaying(true);
  };

  const setVideoRef = useCallback((el: HTMLVideoElement | null, index: number) => {
    videoRefs.current[index] = el;
  }, []);

  const currentReel = reelsData[currentReelIndex];

  return (
    <div className="reels-container" onWheel={handleScroll}>
      <div className="reels-header">
        <h2>Reels</h2>
      </div>
      
      <div className="reel-video-container">
        <video
          ref={(el) => setVideoRef(el, currentReelIndex)}
          src={currentReel.videoUrl}
          loop
          muted
          autoPlay
          onClick={handleVideoClick}
          className="reel-video"
        />
        
        <div className="reel-overlay">
          <div className="reel-info">
            <div className="reel-user">
              <ProfileAvatar 
                firstName={currentReel.firstName} 
                lastName={currentReel.lastName} 
                size={40}
                className="reel-avatar"
              />
              <span className="reel-username">{currentReel.username}</span>
              <button className="follow-btn">Follow</button>
            </div>
            
            <div className="reel-caption">
              <p>{currentReel.caption}</p>
            </div>
          </div>
          
          <div className="reel-actions">
            <button 
              className={`action-btn ${currentReel.isLiked ? 'liked' : ''}`}
              onClick={() => handleLike(currentReel.id)}
            >
              <Heart size={28} fill={currentReel.isLiked ? '#ff3040' : 'none'} />
              <span>{currentReel.likes}</span>
            </button>
            
            <button className="action-btn">
              <MessageCircle size={28} />
              <span>{currentReel.comments}</span>
            </button>
            
            <button className="action-btn">
              <Send size={28} />
            </button>
            
            <button 
              className={`action-btn ${currentReel.isSaved ? 'saved' : ''}`}
              onClick={() => handleSave(currentReel.id)}
            >
              <Bookmark size={28} fill={currentReel.isSaved ? '#ffffff' : 'none'} />
            </button>
            
            <button className="action-btn">
              <MoreHorizontal size={28} />
            </button>
          </div>
          
          <div className="reel-play-controls">
            <button className="play-btn" onClick={handleVideoClick}>
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      <div className="reels-indicator">
        {reelsData.map((_, index) => (
          <div 
            key={index}
            className={`indicator-dot ${index === currentReelIndex ? 'active' : ''}`}
            onClick={() => setCurrentReelIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default Reels;
