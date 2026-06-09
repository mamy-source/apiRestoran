import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import logger from '../libs/logger.lib.js';

// Helper function to get IP address (works with IPv4 and IPv6)
const getIpAddress = (req) => {
  return req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
};

// 1. General API rate limit (ny API rehetra)
export const generalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: {
    success: false,
    message: '⏰ Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((env.RATE_LIMIT_WINDOW_MS || 900000) / 1000 / 60),
  },
  standardHeaders: true,
  legacyHeaders: false,
  // FANITSANA: tsy mampiasa custom keyGenerator intsony
  skip: (req) => {
    return req.path === '/health' || req.path === '/ready' || req.path === '/live';
  },
  handler: (req, res, next, options) => {
    logger.warn(`🚨 Rate limit exceeded for IP: ${getIpAddress(req)} on ${req.method} ${req.url}`);
    res.status(options.statusCode).json(options.message);
  },
});

// 2. Strict rate limit for authentication (login, register)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts only
  message: {
    success: false,
    message: '⏰ Too many authentication attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  // FANITSANA: tsy mampiasa custom keyGenerator intsony
  handler: (req, res, next, options) => {
    const identifier = req.body?.email || getIpAddress(req);
    logger.warn(`🚨 Auth rate limit exceeded for ${identifier}`);
    res.status(options.statusCode).json(options.message);
  },
});

// 3. Very strict rate limit for password reset
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    success: false,
    message: '⏰ Too many password reset attempts. Please try again after 1 hour.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // FANITSANA: tsy mampiasa custom keyGenerator intsony
});

// 4. Rate limit for guest orders (prevent abuse)
export const guestOrderRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 orders per hour per guest session
  message: {
    success: false,
    message: '⏰ Too many orders from guest account. Please create an account or try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  // FANITSANA: tsy mampiasa custom keyGenerator intsony
  keyGenerator: (req) => {
    // Use session token or IP as fallback (but this is allowed)
    return req.cookies?.session_token || getIpAddress(req);
  },
});

// 5. Rate limit for API key based endpoints (if needed)
export const apiKeyRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    success: false,
    message: '⏰ API rate limit exceeded.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.headers['x-api-key'] || getIpAddress(req);
  },
});

// Default export - general rate limit for all routes
export default generalRateLimit;