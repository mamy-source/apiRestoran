import { z } from 'zod';

export const createGuestSessionValidator = z.object({
  deviceInfo: z.string().optional(),
});

export const updateGuestValidator = z.object({
  fullName: z.string().min(2).max(100).optional(),
  phoneNumber: z.string().optional(),
});