import { Router } from 'express';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getUserOrders,
  updateOrderStatus,
  updateOrderItems,
  cancelOrder,
  getOrderStatistics,
} from '../controllers/order.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const routerOrder = Router();

// Create order (authenticated or guest via guest session)
routerOrder.post('/', optionalAuth, createOrder);

// User orders (authenticated only)
routerOrder.get('/my-orders', protect, getUserOrders);

// Order statistics (Admin/Manager)
routerOrder.get('/statistics', protect, restrictTo('ADMIN', 'MANAGER'), getOrderStatistics);

// Order CRUD (authenticated)
routerOrder.get('/:id', protect, getOrderById);
routerOrder.patch('/:id/status', protect, updateOrderStatus);
routerOrder.put('/:id/items', protect, updateOrderItems);
routerOrder.post('/:id/cancel', protect, cancelOrder);

// Admin only - view all orders
routerOrder.get('/', protect, restrictTo('ADMIN', 'MANAGER', 'WAITER'), getAllOrders);

export default routerOrder;