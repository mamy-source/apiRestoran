import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import logger from './logger.lib.js';

/**
 * Generate access token (court terme)
 */
export const generateAccessToken = (payload) => {
  try {
    const token = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN || '7d',
      issuer: 'resto-api',
      audience: 'resto-client',
    });
    
    logger.debug(' Access token generated', { userId: payload.id });
    return token;
  } catch (error) {
    logger.error(' Failed to generate access token:', error);
    throw new Error('Token generation failed');
  }
};

/**
 * Generate refresh token (long terme)
 */
export const generateRefreshToken = (payload) => {
  try {
    const token = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN || '30d',
      issuer: 'resto-api',
      audience: 'resto-client',
    });
    
    logger.debug(' Refresh token generated', { userId: payload.id });
    return token;
  } catch (error) {
    logger.error(' Failed to generate refresh token:', error);
    throw new Error('Token generation failed');
  }
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      issuer: 'resto-api',
      audience: 'resto-client',
    });
    
    logger.debug(' Access token verified', { userId: decoded.id });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.debug(' Access token expired');
    } else if (error.name === 'JsonWebTokenError') {
      logger.debug(' Invalid access token');
    } else {
      logger.error(' Token verification error:', error);
    }
    return null;
  }
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'resto-api',
      audience: 'resto-client',
    });
    
    logger.debug(' Refresh token verified', { userId: decoded.id });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.debug(' Refresh token expired');
    } else if (error.name === 'JsonWebTokenError') {
      logger.debug(' Invalid refresh token');
    } else {
      logger.error(' Refresh token verification error:', error);
    }
    return null;
  }
};

/**
 * Generate both tokens together
 */
export const generateTokens = (payload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

/**
 * Decode token without verification (for debugging only)
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    logger.error(' Token decode error:', error);
    return null;
  }
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateTokens,
  decodeToken,
};