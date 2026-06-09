import argon2 from 'argon2';
import { env } from '../config/env.js';
import logger from './logger.lib.js';

/**
 * Configuration Argon2 optimisée
 */
const getArgon2Config = () => {
  const envName = env.NODE_ENV || 'development';
  
  const configs = {
    production: {
      type: argon2.argon2id,
      memoryCost: env.ARGON2_MEMORY_COST || 65536,  // 64 MB
      timeCost: env.ARGON2_TIME_COST || 3,
      parallelism: env.ARGON2_PARALLELISM || 4,
      hashLength: 32,
      saltLength: 16,
    },
    development: {
      type: argon2.argon2id,
      memoryCost: env.ARGON2_MEMORY_COST || 16384,  // 16 MB
      timeCost: env.ARGON2_TIME_COST || 2,
      parallelism: env.ARGON2_PARALLELISM || 2,
      hashLength: 32,
      saltLength: 16,
    },
    test: {
      type: argon2.argon2id,
      memoryCost: 4096,   // 4 MB
      timeCost: 1,
      parallelism: 1,
      hashLength: 32,
      saltLength: 16,
    },
  };

  return configs[envName] || configs.development;
};

/**
 * Hash password using Argon2
 */
export const hashPassword = async (password) => {
  try {
    const config = getArgon2Config();
    const hash = await argon2.hash(password, config);
    
    logger.debug(' Password hashed successfully', {
      algorithm: 'argon2id',
      memoryCost: config.memoryCost,
      timeCost: config.timeCost,
    });
    
    return hash;
  } catch (error) {
    logger.error(' Failed to hash password:', error);
    throw new Error('Password hashing failed');
  }
};

/**
 * Verify password against hash
 */
export const verifyPassword = async (password, hash) => {
  try {
    const isValid = await argon2.verify(hash, password);
    
    if (!isValid) {
      logger.debug(' Password verification failed');
    } else {
      logger.debug(' Password verification success');
    }
    
    return isValid;
  } catch (error) {
    logger.error('Password verification error:', error);
    
    if (error.message.includes('Invalid hash')) {
      return false;
    }
    
    throw new Error('Password verification failed');
  }
};

/**
 * Check if password needs rehash
 */
export const needsRehash = async (hash) => {
  try {
    const config = getArgon2Config();
    return await argon2.needsRehash(hash, config);
  } catch (error) {
    logger.error(' Failed to check rehash needs:', error);
    return false;
  }
};

/**
 * Generate temporary password
 */
export const generateTemporaryPassword = async () => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  
  const hash = await hashPassword(password);
  
  return { plain: password, hash };
};

export default {
  hashPassword,
  verifyPassword,
  needsRehash,
  generateTemporaryPassword,
};