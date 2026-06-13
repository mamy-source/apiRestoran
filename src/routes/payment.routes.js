import { Router } from 'express';
import {
  createPayment,
  processPayment,
  getPaymentByOrderId,
  getPaymentById,
  getPendingPayments,
} from '../controllers/payment.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const routerPayment = Router();

// Payment routes (protected)
routerPayment.use(protect);

// Payments by order
routerPayment.post('/order/:orderId', createPayment);
routerPayment.get('/order/:orderId', getPaymentByOrderId);

// Admin only
routerPayment.get('/pending', restrictTo('ADMIN', 'MANAGER', 'CASHIER'), getPendingPayments);


// Payment by ID
routerPayment.get('/:id', getPaymentById);
routerPayment.patch('/:paymentId/process', restrictTo('ADMIN', 'MANAGER', 'CASHIER'), processPayment);


export default routerPayment;