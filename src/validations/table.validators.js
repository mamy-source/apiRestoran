import { z } from 'zod';

export const createTableSchema = z.object({
  number: z.number()
    .int('Le numéro doit être un entier')
    .positive('Le numéro doit être positif'),
  capacity: z.number()
    .int()
    .min(1, 'La capacité doit être au moins 1')
    .max(20, 'La capacité maximale est 20'),
  status: z.enum(['FREE', 'RESERVED', 'OCCUPIED']).default('FREE').optional(),
});

export const updateTableSchema = z.object({
  number: z.number().int().positive().optional(),
  capacity: z.number().int().min(1).max(20).optional(),
  status: z.enum(['FREE', 'RESERVED', 'OCCUPIED']).optional(),
});

export const updateTableStatusSchema = z.object({
  status: z.enum(['FREE', 'RESERVED', 'OCCUPIED']),
});