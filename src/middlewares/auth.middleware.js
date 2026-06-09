import { verifyAccessToken } from "../libs/jwt.lib";
import prisma from "../config/prisma";
import { sendError } from "../utils/response";
import logger from "../libs/logger.lib.js";


/**
 * Middleware to protect routes (require authentication)
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return sendError(res, 'You are not logged. Please loggin', 401);
    }

    // Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return sendError(res, 'Invalid token  or expired. Please loggin again.', 401);
    }

    // Check if user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      return sendError(res, 'user not exists or deleted.', 401);
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    logger.error(' Auth middleware error:', error);
    return sendError(res, 'Authentification error', 500);
  }
};

/**
 * Middleware to restrict access based on roles
 * @param {...string} roles - Allowed roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 'Acces denied', 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Acces denied for this resource.', 403);
    }

    next();
  };
};

/**
 * Middleware for optional authentication (user may or may not be logged in)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await prisma.user.findUnique({
          where: { id: decoded.id, deletedAt: null },
          select: {
            id: true,
            email: true,
            fullName: true,
            role: true,
          },
        });
        if (user) {
          req.user = user;
        }
      }
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next();
  }
};

/**
 * Check if user is admin
 */
export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return sendError(res, 'Acces admin utils', 403);
  }
  next();
};

/**
 * Check if user is manager or admin
 */
export const isManagerOrAdmin = (req, res, next) => {
  if (!req.user || !['ADMIN', 'MANAGER'].includes(req.user.role)) {
    return sendError(res, 'Acces manager or admin requis', 403);
  }
  next();
};

export default {
  protect,
  restrictTo,
  optionalAuth,
  isAdmin,
  isManagerOrAdmin,
};