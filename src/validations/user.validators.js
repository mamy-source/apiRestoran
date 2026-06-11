import { z } from 'zod';

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').optional(),
  phoneNumber: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, 'Le nouveau mot de passe doit contenir au moins 6 caractères').optional(),
}).refine(data => {
  // Si newPassword est fourni, currentPassword doit aussi être fourni
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Le mot de passe actuel est requis pour changer le mot de passe',
  path: ['currentPassword'],
});

// ✅ Admin only: pour changer le role d'un utilisateur
export const updateUserRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MANAGER', 'WAITER', 'CHEF', 'CASHIER', 'CLIENT']),
});