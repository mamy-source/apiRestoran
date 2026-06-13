import { z } from 'zod';

export const createPaymentSchema = z.object({
  method: z.enum(['CASH', 'CARD', 'MOBILE_MONEY']),
  amount: z.number().positive().optional(),
  transactionRef: z.string().optional(),
  paymentGateway: z.string().optional(),
});

export const processPaymentSchema = z.object({
  success: z.boolean().default(true),
});