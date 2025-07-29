import rateLimit from 'express-rate-limit';

// Different rate limits for different endpoints
const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message,
    standardHeaders: true,
    legacyHeaders: false,
    // Skip successful requests to static files
    skipSuccessfulRequests: true,
    // Don't count failed requests
    skipFailedRequests: true,
  });
};

// General API rate limiter - more permissive
export const generalApiLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  500, // 500 requests per IP (increased from 100)
  'Too many requests from this IP, please try again later.'
);

// Authentication rate limiter - stricter for security
export const authLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  50, // 50 auth requests per IP
  'Too many authentication attempts, please try again later.'
);

// Admin dashboard limiter - more permissive for admin operations
export const adminLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  1000, // 1000 requests per IP for admin operations
  'Too many admin requests, please try again later.'
);

// File upload limiter - very strict
export const uploadLimiter = createRateLimiter(
  15 * 60 * 1000, // 15 minutes
  20, // 20 uploads per IP
  'Too many file uploads, please try again later.'
);
