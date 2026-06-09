import prisma from '../config/prisma.js';
import { randomUUID } from 'crypto';
import { sendError } from '../utils/response.js';
import logger from '../libs/logger.lib.js';

/**
 * Get client IP address
 */
const getClientIp = (req) => {
  return req.ip || 
         req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         'unknown';
};

/**
 * Create new guest session
 */
export const createGuestSession = async (req, deviceInfo = null) => {
  const sessionToken = randomUUID();
  const ipAddress = getClientIp(req);
  
  const guest = await prisma.user.create({
    data: {
      fullName: `Invité_${Date.now()}`,
      role: 'GUEST',
      guestSessionId: sessionToken,
    },
  });

  await prisma.guestSession.create({
    data: {
      sessionToken,
      deviceInfo: deviceInfo || req.headers['user-agent'],
      ipAddress,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      userId: guest.id,
    },
  });

  logger.debug(' New guest session created', { guestId: guest.id, sessionToken });

  return {
    guest,
    sessionToken,
  };
};

/**
 * Get guest by session token
 */
export const getGuestBySessionToken = async (sessionToken) => {
  const session = await prisma.guestSession.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session) {
    return null;
  }

  // Check if session expired
  if (session.expiresAt < new Date()) {
    await prisma.guestSession.delete({ where: { sessionToken } });
    return null;
  }

  return session.user;
};

/**
 * Middleware to protect guest routes (require guest session)
 */
export const guestProtect = async (req, res, next) => {
  try {
    let sessionToken = req.cookies?.session_token;

    // Also check Authorization header for guest token
    const authHeader = req.headers.authorization;
    if (!sessionToken && authHeader && authHeader.startsWith('Guest ')) {
      sessionToken = authHeader.split(' ')[1];
    }

    // If no session token, create new guest session
    if (!sessionToken) {
      const { guest, sessionToken: newToken } = await createGuestSession(req);
      
      // Set cookie
      res.cookie('session_token', newToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      
      req.guest = guest;
      return next();
    }

    // Verify existing session
    const guest = await getGuestBySessionToken(sessionToken);
    
    if (!guest) {
      // Session expired or invalid, create new one
      const { guest: newGuest, sessionToken: newToken } = await createGuestSession(req);
      
      res.cookie('session_token', newToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });
      
      req.guest = newGuest;
      return next();
    }

    req.guest = guest;
    next();
  } catch (error) {
    logger.error(' Guest middleware error:', error);
    return sendError(res, 'Erreur de session guest', 500);
  }
};

/**
 * Optional guest middleware (doesn't create session if not exists)
 */
export const optionalGuest = async (req, res, next) => {
  try {
    const sessionToken = req.cookies?.session_token;
    
    if (sessionToken) {
      const guest = await getGuestBySessionToken(sessionToken);
      if (guest) {
        req.guest = guest;
      }
    }
    
    next();
  } catch (error) {
    logger.error(' Optional guest middleware error:', error);
    next();
  }
};

/**
 * Renew guest session (extend expiration)
 */
export const renewGuestSession = async (req, res, next) => {
  try {
    const sessionToken = req.cookies?.session_token;
    
    if (sessionToken && req.guest) {
      await prisma.guestSession.update({
        where: { sessionToken },
        data: {
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
      
      logger.debug(' Guest session renewed', { guestId: req.guest.id });
    }
    
    next();
  } catch (error) {
    logger.error(' Renew guest session error:', error);
    next();
  }
};

export default {
  guestProtect,
  optionalGuest,
  renewGuestSession,
  createGuestSession,
  getGuestBySessionToken,
};