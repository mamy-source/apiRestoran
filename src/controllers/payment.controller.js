import PaymentService from "../services/payment.service.js";
import { sendCreated, sendSuccess } from "../utils/response.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { createPaymentSchema, processPaymentSchema } from "../validations/payment.validators.js";


// Create payment
export const createPayment = asyncHandler(async (req, res) => {
  const validation = createPaymentSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, errors: validation.error.errors });
  }

  const payment = await PaymentService.createPayment(req.params.orderId, validation.data);
  sendCreated(res, payment, 'Paiement créé avec succès');
});

// Process payment (simulate)
export const processPayment = asyncHandler(async (req, res) => {
  const validation = processPaymentSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, errors: validation.error.errors });
  }

  const payment = await PaymentService.processPayment(req.params.paymentId, validation.data.success);
  sendSuccess(res, payment, `Paiement ${payment.status === 'PAID' ? 'réussi' : 'échoué'}`);
});

// Get payment by order ID
export const getPaymentByOrderId = asyncHandler(async (req, res) => {
  const payment = await PaymentService.getPaymentByOrderId(req.params.orderId);
  sendSuccess(res, payment, 'Paiement récupéré');
});

// Get payment by ID
export const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await PaymentService.getPaymentById(req.params.id);
  sendSuccess(res, payment, 'Paiement récupéré');
});

// Get pending payments (Admin only)
export const getPendingPayments = asyncHandler(async (req, res) => {
  const payments = await PaymentService.getPendingPayments();
  sendSuccess(res, payments, 'Paiements en attente');
});