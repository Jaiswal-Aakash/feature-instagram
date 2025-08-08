import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Phone, AlertCircle, CheckCircle } from 'lucide-react';

interface RegisterProps {
  onSwitchToLogin: () => void;
  onRegister: (formData: RegisterFormData) => Promise<void>;
}

interface RegisterFormData {
  email: string;
  fullName: string;
  username: string;
  password: string;
  confirmPassword: string;
  phone?: string;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin, onRegister }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    email: '',
    fullName: '',
    username: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9._]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, dots, and underscores';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation (optional)
    if (formData.phone && !/^\+?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await onRegister(formData);
    } catch (error) {
      console.error('Registration error:', error);
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

  const getPasswordStrength = () => {
    if (!formData.password) return { strength: 0, color: '', text: '' };
    
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[a-z]/.test(formData.password)) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/\d/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;

    const colors = ['#ff4444', '#ff8800', '#ffbb33', '#00C851', '#007E33'];
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    
    return {
      strength: Math.min(strength, 4),
      color: colors[Math.min(strength, 4)],
      text: texts[Math.min(strength, 4)]
    };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-logo">Instagram</h1>
          <p className="auth-subtitle">Sign up to see photos and videos from your friends.</p>
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
              <User size={20} className="input-icon" />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`form-input ${errors.fullName ? 'error' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.fullName && (
              <div className="error-message">
                <AlertCircle size={16} />
                {errors.fullName}
              </div>
            )}
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`form-input ${errors.username ? 'error' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.username && (
              <div className="error-message">
                <AlertCircle size={16} />
                {errors.username}
              </div>
            )}
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Phone size={20} className="input-icon" />
              <input
                type="tel"
                placeholder="Phone Number (optional)"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`form-input ${errors.phone ? 'error' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.phone && (
              <div className="error-message">
                <AlertCircle size={16} />
                {errors.phone}
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
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className="strength-fill" 
                    style={{ 
                      width: `${(passwordStrength.strength / 4) * 100}%`,
                      backgroundColor: passwordStrength.color
                    }}
                  />
                </div>
                <span className="strength-text" style={{ color: passwordStrength.color }}>
                  {passwordStrength.text}
                </span>
              </div>
            )}
            {errors.password && (
              <div className="error-message">
                <AlertCircle size={16} />
                {errors.password}
              </div>
            )}
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <div className="success-message">
                <CheckCircle size={16} />
                Passwords match
              </div>
            )}
            {errors.confirmPassword && (
              <div className="error-message">
                <AlertCircle size={16} />
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <button
            type="submit"
            className={`auth-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-divider">
          <span>OR</span>
        </div>

        <button className="facebook-login">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M20 10.061C20 4.505 15.522 0 10 0S0 4.505 0 10.061c0 5.022 3.657 9.184 8.438 9.939v-7.03h-2.54v-2.909h2.54V7.845c0-2.522 1.492-3.915 3.777-3.915 1.094 0 2.238.195 2.238.195v2.476h-1.26c-1.243 0-1.63.775-1.63 1.572v1.888h2.773l-.443 2.908h-2.33V20c4.78-.755 8.437-4.917 8.437-9.939z"/>
          </svg>
          Sign up with Facebook
        </button>
      </div>

      <div className="auth-card">
        <p className="switch-text">
          Have an account?{' '}
          <button className="switch-link" onClick={onSwitchToLogin}>
            Log in
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

export default Register;
