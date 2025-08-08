const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Access token expires in 7 days
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Refresh token expires in 7 days
  );
};

// Register new user
const register = async (req, res) => {
  try {
    const { email, fullName, username, password, confirmPassword, phone } = req.body;

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'Password mismatch',
        message: 'Passwords do not match'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        error: 'Email already exists',
        message: 'An account with this email already exists'
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        error: 'Username already exists',
        message: 'This username is already taken'
      });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      fullName,
      username,
      password,
      phone: phone || undefined
    });

    await user.save();

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registered successfully',
      user: userResponse,
      token: accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation error',
        message: errors.join(', ')
      });
    }

    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email or username
    const user = await User.findByEmailOrUsername(email).select('+password');
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        error: 'Account locked',
        message: 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate tokens
    const accessToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token: accessToken,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const userId = req.user._id;

    if (refreshToken) {
      // Remove the specific refresh token
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { token: refreshToken } }
      });
    }

    res.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'An error occurred during logout'
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token required',
        message: 'Please provide a refresh token'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'User not found'
      });
    }

    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken);
    if (!tokenExists) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Refresh token not found'
      });
    }

    // Generate new access token
    const newAccessToken = generateToken(user._id);

    res.json({
      message: 'Token refreshed successfully',
      token: newAccessToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'The provided refresh token is invalid'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Refresh token expired',
        message: 'Your refresh token has expired. Please log in again.'
      });
    }

    res.status(500).json({
      error: 'Token refresh failed',
      message: 'An error occurred while refreshing the token'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('followers', 'username fullName avatar')
      .populate('following', 'username fullName avatar');

    res.json(user);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Profile retrieval failed',
      message: 'An error occurred while retrieving your profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, username, bio, phone, avatar, isPrivate, website, location } = req.body;
    const userId = req.user._id;

    // Check if username is being changed and if it's available
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          error: 'Username already exists',
          message: 'This username is already taken'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        username,
        bio,
        phone,
        avatar,
        isPrivate,
        website,
        location
      },
      { new: true, runValidators: true }
    ).populate('followers', 'username fullName avatar')
     .populate('following', 'username fullName avatar');

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        error: 'Validation error',
        message: errors.join(', ')
      });
    }

    res.status(500).json({
      error: 'Profile update failed',
      message: 'An error occurred while updating your profile'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'Password mismatch',
        message: 'New passwords do not match'
      });
    }

    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: 'Invalid current password',
        message: 'Your current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Invalidate all refresh tokens
    user.refreshTokens = [];
    await user.save();

    res.json({
      message: 'Password changed successfully. Please log in again.'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'An error occurred while changing your password'
    });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.passwordResetToken = resetTokenHash;
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // In a real application, send email with reset link
    // For now, we'll just return the token (in production, send via email)
    res.json({
      message: 'Password reset link sent to your email',
      resetToken // Remove this in production
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      message: 'An error occurred while processing your request'
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: 'Password mismatch',
        message: 'Passwords do not match'
      });
    }

    // Hash the reset token
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
      passwordResetToken: resetTokenHash,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
        message: 'The password reset link is invalid or has expired'
      });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      message: 'An error occurred while resetting your password'
    });
  }
};

// Check if username is available
const checkUsername = async (req, res) => {
  try {
    const { username } = req.params;
    
    const isAvailable = await User.isUsernameAvailable(username);
    
    res.json({
      available: isAvailable,
      username
    });

  } catch (error) {
    console.error('Check username error:', error);
    res.status(500).json({
      error: 'Username check failed',
      message: 'An error occurred while checking username availability'
    });
  }
};

// Check if email is available
const checkEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    const isAvailable = await User.isEmailAvailable(email);
    
    res.json({
      available: isAvailable,
      email
    });

  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      error: 'Email check failed',
      message: 'An error occurred while checking email availability'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  checkUsername,
  checkEmail
};
