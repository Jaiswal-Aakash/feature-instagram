import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';

interface LoginProps {
  onSwitchToRegister: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onLogin(formData.email, formData.password);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">Instagram</h1>
          <p className="auth-subtitle">Log in to see photos and videos from your friends.</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-wrapper">
              <Mail size={20} className="input-icon" />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.email && (
              <div className="error-message">
                <AlertCircle size={16} />
                {errors.email}
              </div>
            )}
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`form-input ${errors.password ? 'error' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <div className="error-message">
                <AlertCircle size={16} />
                {errors.password}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button className="facebook-login">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M20 10.061C20 4.505 15.522 0 10 0S0 4.505 0 10.061c0 5.022 3.657 9.184 8.438 9.939v-7.03h-2.54v-2.909h2.54V7.845c0-2.522 1.492-3.915 3.777-3.915 1.094 0 2.238.195 2.238.195v2.476h-1.26c-1.243 0-1.63.775-1.63 1.572v1.888h2.773l-.443 2.908h-2.33V20c4.78-.755 8.437-4.917 8.437-9.939z"/>
          </svg>
          Log in with Facebook
        </button>

        <div className="auth-footer">
          <button className="forgot-password">Forgot password?</button>
        </div>
      </div>

      <div className="auth-card">
        <p className="switch-text">
          Don't have an account?{' '}
          <button className="switch-link" onClick={onSwitchToRegister}>
            Sign up
          </button>
        </p>
      </div>

      <div className="auth-apps">
        <p>Get the app.</p>
        <div className="app-buttons">
          <button className="app-button">
            <img src="https://www.instagram.com/static/images/appstore-install-badges/badge_ios_english-en.png/180ae7a0bcf7.png" alt="App Store" />
          </button>
          <button className="app-button">
            <img src="https://www.instagram.com/static/images/appstore-install-badges/badge_android_english-en.png/e9cd846dc748.png" alt="Google Play" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
