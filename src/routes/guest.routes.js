import { Router } from 'express';
import {
  createGuestSession,
  getGuestInfo,
  updateGuestInfo,
} from '../controllers/guest.controller.js';
import { guestProtect } from '../middlewares/guest.middleware.js';

const guestRoutes = Router();

// Public route - create guest session
guestRoutes.post('/session', createGuestSession);

// Protected routes (need guest session)
guestRoutes.get('/me', guestProtect, getGuestInfo);
guestRoutes.patch('/me', guestProtect, updateGuestInfo);

export default guestRoutes;