import { z } from 'zod';

export const generateInvoiceSchema = z.object({
  format: z.enum(['POS', 'A4', 'A5', 'THERMAL']).default('A4'),
  action: z.enum(['print', 'download', 'view']).default('view'),
});

export const regenerateInvoiceSchema = z.object({
  format: z.enum(['POS', 'A4', 'A5', 'THERMAL']).optional(),
});