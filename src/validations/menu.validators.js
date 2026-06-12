import { z } from 'zod';

export const createMenuSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom est trop long'),
  description: z.string().max(500).optional(),
  price: z.number()
    .positive('Le prix doit être positif')
    .min(0.01, 'Le prix doit être au moins 0.01'),
  available: z.boolean().default(true).optional(),
  availableOnline: z.boolean().default(true).optional(),
  categoryId: z.string().uuid('Category ID invalide'),
});

export const updateMenuSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  price: z.number().positive().optional(),
  available: z.boolean().optional(),
  availableOnline: z.boolean().optional(),
  categoryId: z.string().uuid().optional(),
});