import React from 'react';
import ProfileAvatar from './ProfileAvatar';

const RightSidebar: React.FC = () => {
  const suggestedAccounts = [
    { username: 'bangloreflats', firstName: 'Bangalore', lastName: 'Flats', isVerified: false },
    { username: 'tensor._.boy', firstName: 'Tensor', lastName: 'Boy', isVerified: true },
    { username: '_kings_nj', firstName: 'Kings', lastName: 'NJ', isVerified: false },
    { username: '21_thru', firstName: 'Twenty', lastName: 'One', isVerified: false },
    { username: 'shreyajaiswal8797', firstName: 'Shreya', lastName: 'Jaiswal', isVerified: false },
  ];

  return (
    <div className="right-sidebar">
      <div className="user-profile">
        <div className="profile-info">
          <ProfileAvatar 
            firstName="Akash" 
            lastName="Jaiswal" 
            size={44}
            className="profile-avatar"
          />
          <div className="profile-details">
            <span className="profile-username">akashjaiswal0706</span>
            <span className="profile-name">Akash Jaiswal</span>
          </div>
        </div>
        <button className="switch-btn">Switch</button>
      </div>

      <div className="suggestions-section">
        <div className="suggestions-header">
          <span className="suggestions-title">Suggested for you</span>
          <button className="see-all-btn">See All</button>
        </div>
        
        <div className="suggested-accounts">
          {suggestedAccounts.map((account, index) => (
            <div key={index} className="suggested-account">
              <div className="account-info">
                <ProfileAvatar 
                  firstName={account.firstName} 
                  lastName={account.lastName} 
                  size={32}
                  className="account-avatar"
                />
                <div className="account-details">
                  <span className="account-username">
                    {account.username}
                    {account.isVerified && <span className="verified-badge">✓</span>}
                  </span>
                  <span className="account-name">{account.firstName} {account.lastName}</span>
                </div>
              </div>
              <button className="follow-btn">Follow</button>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-links">
        <div className="footer-row">
          <a href="#" className="footer-link">About</a>
          <a href="#" className="footer-link">Help</a>
          <a href="#" className="footer-link">Press</a>
          <a href="#" className="footer-link">API</a>
          <a href="#" className="footer-link">Jobs</a>
        </div>
        <div className="footer-row">
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Terms</a>
          <a href="#" className="footer-link">Locations</a>
          <a href="#" className="footer-link">Language</a>
          <a href="#" className="footer-link">Meta Verified</a>
        </div>
        <div className="copyright">
          © 2025 INSTAGRAM FROM META
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
