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

// ==================== Routes protégées (authentification requise) ====================
router.use(protect);

// ==================== User (ny tenany ihany) ====================
router.get('/profile', getProfile);
router.put('/profile', uploadSingle('users', 'avatar'), updateProfile);
router.delete('/profile/avatar', deleteAvatar);

// ==================== ADMIN ONLY ====================
// Ny ADMIN ihany no afaka miditra amin'ireto routes ireto
router.use(restrictTo('ADMIN'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;