import jwt from 'jsonwebtoken';
import models from '../models/index.js';
import config from '../config/index.js';
import { AppError } from '../utils/errorHandler.js';

const { User } = models;

// Protect routes - authentication middleware
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('Access denied. Please login to access this resource.', 401));
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, config.jwt.secret);

      // Get user from token
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return next(new AppError('User not found. Please login again.', 401));
      }

      // Check if user is active
      if (!user.is_active) {
        return next(new AppError('Account has been deactivated. Please contact support.', 401));
      }

      // Grant access to protected route
      req.user = user;
      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return next(new AppError('Token expired. Please login again.', 401));
      } else if (jwtError.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please login again.', 401));
      } else {
        return next(new AppError('Token verification failed. Please login again.', 401));
      }
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Access denied. Role '${req.user.role}' is not authorized to access this resource.`, 403));
    }
    next();
  };
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // Check for token in cookies
    else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        // Verify token
        const decoded = jwt.verify(token, config.jwt.secret);

        // Get user from token
        const user = await User.findByPk(decoded.userId);

        if (user && user.is_active) {
          req.user = user;
        }
      } catch (jwtError) {
        // Token is invalid, but we don't throw an error
        // Just continue without setting req.user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
