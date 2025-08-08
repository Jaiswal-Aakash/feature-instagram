import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import { useAuth } from '../../contexts/AuthContext';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      await login(email, password);
    } catch (error: any) {
      alert(error.message || 'Login failed. Please try again.');
    }
  };

  const handleRegister = async (formData: any) => {
    try {
      await register(formData);
    } catch (error: any) {
      alert(error.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <img 
          src="/authImage.png" 
          alt="Instagram Clone Preview" 
          className="auth-preview-image"
        />
      </div>

      <div className="auth-content">
        {isLogin ? (
          <Login
            onSwitchToRegister={() => setIsLogin(false)}
            onLogin={handleLogin}
          />
        ) : (
          <Register
            onSwitchToLogin={() => setIsLogin(true)}
            onRegister={handleRegister}
          />
        )}
      </div>
    </div>
  );
};

export default AuthScreen;
