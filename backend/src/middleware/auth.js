const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { errorResponse } = require('../utils/response');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers?.authorization || req.header?.('Authorization');
    const token = authHeader?.toLowerCase().startsWith('bearer ')
        ? authHeader.slice(7).trim()
        : null;

    if (!token) {
        return errorResponse(res, 401, 'Access denied. No token provided.');
    }

    const secret = process.env.JWT_SECRET || 'secret';
    let decoded;
    try {
        decoded = jwt.verify(token, secret);
    } catch (error) {
        throw error;
    }

    const userId = decoded.userId || decoded.id;
    const user = await User.findById(userId);

    if (!user) {
        return errorResponse(res, 401, 'Invalid token. User not found.');
    }

    // Checking if user is active (we don't have is_active explicitly on User in exhibitorhub yet, but we will assume true if not specified)
    if (user.is_active === false) {
        return errorResponse(res, 403, 'Account is deactivated.');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
        console.error('🔐 JWT Verification Error:', error.message);
        return errorResponse(res, 401, 'Invalid token.');
    }
    if (error.name === 'TokenExpiredError') {
        console.error('🔐 Token Expired:', error.message);
        return errorResponse(res, 401, 'Token expired. Please login again.');
    }
    console.error('🔐 Authentication Error:', error.message);
    return errorResponse(res, 500, 'Authentication error.', error.message);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
      if (!req.user) {
          return errorResponse(res, 403, 'Access denied. No permission — please authenticate first.');
      }

      if (roles.length && !roles.includes(req.user.role)) {
          return errorResponse(res, 403, `Access denied. Insufficient permission. Required role: ${roles.join(' or ')}`);
      }

      next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
      const authHeader = req.headers?.authorization || req.header?.('Authorization');
      const token = authHeader?.toLowerCase().startsWith('bearer ')
          ? authHeader.slice(7).trim()
          : null;

      if (token) {
          const secret = process.env.JWT_SECRET || 'secret';
          try {
              const decoded = jwt.verify(token, secret);
              const userId = decoded.userId || decoded.id;
              const user = await User.findById(userId);

              if (user && user.is_active !== false) {
                  req.user = user;
              }
          } catch (verifyError) {
              console.warn('Optional auth token is invalid:', verifyError.message);
          }
      }
      next();
  } catch (error) {
      next();
  }
};

module.exports = { protect, authorize, optionalAuth };
