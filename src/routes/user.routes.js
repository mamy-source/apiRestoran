import { Router } from 'express';
import {
  // User (ny tenany)
  getProfile,
  updateProfile,
  deleteAvatar,
  // Admin only
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from '../controllers/user.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { uploadSingle } from '../middlewares/upload.middleware.js';

const router = Router();

router.use(protect);

//user profile routes (authenticated users only)
router.get('/profile', getProfile);
router.put('/profile', uploadSingle('users', 'avatar'), updateProfile);
router.delete('/profile/avatar', deleteAvatar);

//Admin only
router.use(restrictTo('ADMIN'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;