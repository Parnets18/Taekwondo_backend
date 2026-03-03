const jwt = require('jsonwebtoken');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  console.log('🔐 Auth middleware called for:', req.method, req.path);
  console.log('🔍 Headers:', req.headers.authorization ? 'Token present' : 'No token');
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🎫 Token found in headers');
    }

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', decoded.id);

    // Try to get user from Login model first (for student/mobile app login)
    const Login = require('../models/login');
    let user = await Login.findById(decoded.id).select('-password');
    
    // If not found in Login, try User model (for admin/web login)
    if (!user) {
      const User = require('../models/User');
      user = await User.findById(decoded.id).select('-password');
    }
    
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Token is invalid. User not found.'
      });
    }

    // Check if user is active (only for User model which has isActive field)
    if (user.isActive !== undefined && !user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'User account is deactivated.'
      });
    }

    req.user = user;
    console.log('➡️ Proceeding to next middleware');
    next();

  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired.'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Server error during authentication.'
    });
  }
};

// Restrict to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log('Role check - User:', req.user?.role, 'Required roles:', roles);
    if (!req.user || !roles.includes(req.user.role)) {
      console.log('Access denied - insufficient permissions');
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. Insufficient permissions.'
      });
    }
    console.log('Role check passed');
    next();
  };
};

// Admin only middleware
const adminOnly = restrictTo('admin');

// Admin or Instructor middleware
const staffOnly = restrictTo('admin', 'instructor');

module.exports = {
  protect,
  restrictTo,
  adminOnly,
  staffOnly,
  authorize: restrictTo // Add alias for backward compatibility
};