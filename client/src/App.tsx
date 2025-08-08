import React, { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import RightSidebar from './components/RightSidebar';
import CreatePost from './components/features/CreatePost';
import AuthScreen from './components/auth/AuthScreen';
import { AuthProvider, useAuth } from './contexts/AuthContext';

const AppContent: React.FC = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  // Handle URL routing
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const section = path.substring(1) || 'home';
      setActiveSection(section);
    };

    // Set initial section based on URL
    const path = window.location.pathname;
    const section = path.substring(1) || 'home';
    setActiveSection(section);

    // Listen for browser back/forward navigation
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Update URL without page reload
    window.history.pushState({}, '', `/${section === 'home' ? '' : section}`);
  };

  const handleCreatePost = () => {
    setIsCreatePostOpen(true);
  };

  const handleCloseCreatePost = () => {
    setIsCreatePostOpen(false);
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="App">
      <div className="instagram-layout">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onCreatePost={handleCreatePost}
        />
        <MainContent activeSection={activeSection} />
        {activeSection !== 'profile' && <RightSidebar />}
      </div>

      <CreatePost
        isOpen={isCreatePostOpen}
        onClose={handleCloseCreatePost}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
