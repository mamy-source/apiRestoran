import { z } from 'zod';

const orderItemSchema = z.object({
  menuId: z.string().uuid('Menu ID invalide'),
  quantity: z.number().int().min(1, 'La quantité doit être au moins 1').optional(),
});

export const createOrderSchema = z.object({
  tableId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  deliveryAddress: z.string().optional(),
  specialNote: z.string().max(500).optional(),
  source: z.enum(['ONLINE', 'IN_RESTAURANT']).default('IN_RESTAURANT'),
  items: z.array(orderItemSchema).min(1, 'Au moins un article requis'),
}).refine(data => {
  // For online orders, customer info is required
  if (data.source === 'ONLINE') {
    return data.customerName && data.customerPhone;
  }
  return true;
}, {
  message: 'Nom et téléphone requis pour les commandes en ligne',
  path: ['customerName'],
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PREPARING', 'READY', 'SERVED', 'PAID', 'CANCELLED']),
});

export const updateOrderItemsSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Au moins un article requis'),
});