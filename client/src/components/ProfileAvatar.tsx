import React, { useMemo } from 'react';

interface ProfileAvatarProps {
  firstName: string;
  lastName: string;
  size?: number;
  className?: string;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  firstName, 
  lastName, 
  size = 40, 
  className = '' 
}) => {
  // Generate initials from first and last name
  const initials = useMemo(() => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  }, [firstName, lastName]);

  // Generate consistent random color based on name
  const backgroundColor = useMemo(() => {
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#96CEB4', // Green
      '#FFEAA7', // Yellow
      '#DDA0DD', // Plum
      '#98D8C8', // Mint
      '#F7DC6F', // Gold
      '#BB8FCE', // Purple
      '#85C1E9', // Light Blue
      '#F8C471', // Orange
      '#82E0AA', // Light Green
      '#F1948A', // Light Red
      '#85C1E9', // Sky Blue
      '#F7DC6F', // Yellow
      '#D7BDE2', // Light Purple
      '#A9CCE3', // Powder Blue
      '#FAD7A0', // Peach
      '#ABEBC6', // Light Mint
      '#F9E79F', // Cream
    ];
    
    // Create a hash from the name to get consistent color
    const nameHash = (firstName + lastName).split('').reduce((hash, char) => {
      return char.charCodeAt(0) + ((hash << 5) - hash);
    }, 0);
    
    return colors[Math.abs(nameHash) % colors.length];
  }, [firstName, lastName]);

  const avatarStyle = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: `${Math.max(size * 0.4, 12)}px`,
    fontWeight: 600,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
  };

  return (
    <div style={avatarStyle} className={className}>
      {initials}
    </div>
  );
};

export default ProfileAvatar;
