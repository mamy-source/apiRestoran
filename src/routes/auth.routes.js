import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile,
  upgradeToClient,
} from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { guestProtect } from '../middlewares/guest.middleware.js';

const authRoutes = Router();

// Public routes
authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/refresh-token', refreshToken);
authRoutes.post('/upgrade-to-customer', guestProtect, upgradeToClient);

// Protected routes (need authentication)
authRoutes.post('/logout', protect, logout);
authRoutes.get('/profile', protect, getProfile);

export default authRoutes;