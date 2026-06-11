import { hashPassword, verifyPassword } from '../libs/argon2.lib.js';
import { processUploadedImage, deleteImage } from '../services/image.service.js';
import { AppError } from '../middlewares/error.middleware.js';
import logger from '../libs/logger.lib.js';
import UserRepository from '../repository/user.repository.js';


class UserService {
  // Get user profile (ny tenany ihany)
  async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const { password, ...profile } = user;
    return profile;
  }

  // Update user profile (ny tenany ihany - tsy misy role)
  async updateProfile(userId, updateData, avatarFile = null) {
    const { fullName, phoneNumber, currentPassword, newPassword } = updateData;

    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const dataToUpdate = {};

    if (fullName) {
      dataToUpdate.fullName = fullName;
    }

    if (phoneNumber !== undefined) {
      dataToUpdate.phoneNumber = phoneNumber;
    }

    // Changer le mot de passe
    if (currentPassword && newPassword) {
      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        throw new AppError('Mot de passe actuel incorrect', 401);
      }
      dataToUpdate.password = await hashPassword(newPassword);
    }

    // Gérer l'avatar
    if (avatarFile) {
      if (user.avatar) {
        deleteImage(user.avatar);
      }

      const processed = await processUploadedImage(avatarFile, {
        width: 300,
        height: 300,
        quality: 80,
      });
      
      dataToUpdate.avatar = processed.path;
    }

    const updatedUser = await UserRepository.update(userId, dataToUpdate);

    logger.logEvent('PROFILE_UPDATED', userId, {
      fields: Object.keys(dataToUpdate),
    });

    return updatedUser;
  }

  // Delete avatar only
  async deleteAvatar(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    if (user.avatar) {
      deleteImage(user.avatar);
    }

    const updatedUser = await UserRepository.update(userId, { avatar: null });

    logger.logEvent('AVATAR_DELETED', userId);
    return updatedUser;
  }

  // ✅ ADMIN ONLY: Get all users
  async getAllUsers(filters = {}) {
    const users = await UserRepository.findAll(filters);
    return users.map(({ password, ...user }) => user);
  }

  // ✅ ADMIN ONLY: Get user by id
  async getUserById(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }
    const { password, ...profile } = user;
    return profile;
  }

  // ✅ ADMIN ONLY: Update user role
  async updateUserRole(userId, newRole) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Tsy afaka manova ny role GUEST ho CLIENT eto (efa misy upgradeGuestToClient)
    if (user.role === 'GUEST') {
      throw new AppError('Utilisez la route upgrade-to-client pour les guests', 400);
    }

    const updatedUser = await UserRepository.update(userId, { role: newRole });

    logger.logEvent('USER_ROLE_UPDATED', userId, { 
      oldRole: user.role, 
      newRole: newRole,
      updatedBy: 'ADMIN',
    });

    const { password, ...profile } = updatedUser;
    return profile;
  }

  // ✅ ADMIN ONLY: Delete user (soft delete)
  async deleteUser(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    // Supprimer l'avatar si existant
    if (user.avatar) {
      deleteImage(user.avatar);
    }

    await UserRepository.softDelete(userId);

    logger.logEvent('USER_DELETED', userId, { deletedBy: 'ADMIN' });
    return true;
  }
}

export default new UserService();