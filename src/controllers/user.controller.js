import UserService from "../services/user.service.js";
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middlewares/error.middleware.js';
import { updateProfileSchema, updateUserRoleSchema } from '../validations/user.validators.js';

// ==================== USER (ny tenany ihany) ====================

// Get user profile (ny tenany)
export const getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await UserService.getProfile(userId);
  sendSuccess(res, profile, 'Profil récupéré avec succès');
});

// Update user profile (ny tenany - tsy misy role)
export const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const avatarFile = req.file;
  
  const validation = updateProfileSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: validation.error.errors,
    });
  }

  const updatedUser = await UserService.updateProfile(userId, validation.data, avatarFile);
  sendSuccess(res, updatedUser, 'Profil mis à jour avec succès');
});

// Delete avatar only (ny tenany)
export const deleteAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const updatedUser = await UserService.deleteAvatar(userId);
  sendSuccess(res, updatedUser, 'Avatar supprimé avec succès');
});

// ==================== ADMIN ONLY ====================

// Get all users (ADMIN only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const filters = {
    role: req.query.role,
    search: req.query.search,
  };
  const users = await UserService.getAllUsers(filters);
  sendSuccess(res, users, 'Utilisateurs récupérés');
});

// Get user by id (ADMIN only)
export const getUserById = asyncHandler(async (req, res) => {
  const user = await UserService.getUserById(req.params.id);
  sendSuccess(res, user, 'Utilisateur récupéré');
});

// Update user role (ADMIN only)
export const updateUserRole = asyncHandler(async (req, res) => {
  const validation = updateUserRoleSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: validation.error.errors,
    });
  }

  const user = await UserService.updateUserRole(req.params.id, validation.data.role);
  sendSuccess(res, user, 'Rôle mis à jour avec succès');
});

// Delete user (ADMIN only)
export const deleteUser = asyncHandler(async (req, res) => {
  await UserService.deleteUser(req.params.id);
  sendSuccess(res, null, 'Utilisateur supprimé avec succès');
});