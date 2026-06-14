import { Router } from 'express';
import {
  createInvoice,
  regenerateInvoice,
  getInvoiceById,
  getInvoiceByOrderId,
  getInvoiceByNumber,
  getAllInvoices,
  downloadPdf,
  printInvoice,
  deleteInvoice,
} from '../controllers/invoice.controller.js';  
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const routerInvoice = Router();

// Protected routes (any authenticated user can access)
routerInvoice.use(protect);

// Generate invoice for an order
// ?format=POS|A4|A5|THERMAL&action=view|print|download
routerInvoice.post('/order/:orderId', restrictTo('ADMIN', 'MANAGER', 'CASHIER'), createInvoice);
routerInvoice.post('/order/:orderId/regenerate', restrictTo('ADMIN', 'MANAGER', 'CASHIER'), regenerateInvoice);

// Print invoice directly
routerInvoice.get('/order/:orderId/print', printInvoice);

// Consultation
routerInvoice.get('/order/:orderId', getInvoiceByOrderId);
routerInvoice.get('/number/:invoiceNumber', getInvoiceByNumber);
routerInvoice.get('/:id', getInvoiceById);

// Download PDF
routerInvoice.get('/:id/download', downloadPdf);

// Admin only
routerInvoice.get('/', restrictTo('ADMIN', 'MANAGER'), getAllInvoices);
routerInvoice.delete('/:id', restrictTo('ADMIN'), deleteInvoice);

export default routerInvoice;