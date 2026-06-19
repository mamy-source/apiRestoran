import PaymentRepository from "../repository/payment.repository.js";
import OrderRepository from "../repository/order.repository.js";
import { AppError } from "../middlewares/error.middleware.js";
import logger from "../libs/logger.lib.js";
// import audit from "../utils/auditHelper.js";



class PaymentService {
  // Create payment for an order
  async createPayment(orderId, paymentData) {
    const { method, amount, transactionRef, paymentGateway } = paymentData;

    // Check if order exists
    const order = await OrderRepository.findById(orderId);
    if (!order) {
      throw new AppError('Commande non trouvée', 404);
    }

    // Check if payment already exists
    const existingPayment = await PaymentRepository.findByOrderId(orderId);
    if (existingPayment) {
      throw new AppError('Un paiement existe déjà pour cette commande', 400);
    }

    // Check if order can be paid
    if (order.status === 'PAID') {
      throw new AppError('Cette commande est déjà payée', 400);
    }
    if (order.status === 'CANCELLED') {
      throw new AppError('Impossible de payer une commande annulée', 400);
    }

    // Validate amount
    if (amount && amount !== order.total) {
      throw new AppError(`Le montant doit être égal au total de la commande (${order.total})`, 400);
    }

    const payment = await PaymentRepository.create({
      orderId,
      amount: amount || order.total,
      method,
      status: 'PENDING',
      transactionRef,
      paymentGateway,
    });

    logger.logEvent('PAYMENT_CREATED', order.userId || 'guest', {
      orderId,
      paymentId: payment.id,
      amount: payment.amount,
      method,
    });

    // Audit log
    // if(req){
    //   await audit.fromRequest(req, 'CREATE_PAYMENT', 'Payment', payment.id);
    // }

    return payment;
  }

  // Process payment (simulate payment processing)
  async processPayment(paymentId, success = true) {
    const payment = await PaymentRepository.findById(paymentId);
    if (!payment) {
      throw new AppError('Paiement non trouvé', 404);
    }

    if (payment.status !== 'PENDING') {
      throw new AppError(`Ce paiement est déjà ${payment.status}`, 400);
    }

    const newStatus = success ? 'PAID' : 'FAILED';
    const updated = await PaymentRepository.updateStatus(paymentId, newStatus);

    // If payment succeeded, update order status
    if (success) {
      await OrderRepository.updateStatus(payment.orderId, 'PAID');
      
      // Update user loyalty points if user is authenticated
      if (payment.order.userId) {
        // Add loyalty points logic here (2% of total)
        const pointsToAdd = Math.floor(payment.amount * 0.02);
        if (pointsToAdd > 0) {
          await prisma.user.update({
            where: { id: payment.order.userId },
            data: {
              loyaltyPoints: { increment: pointsToAdd },
              totalSpent: { increment: payment.amount },
              orderCount: { increment: 1 },
              lastOrderAt: new Date(),
            },
          });
        }
      }
    }

    logger.logEvent('PAYMENT_PROCESSED', payment.order.userId || 'guest', {
      paymentId,
      orderId: payment.orderId,
      status: newStatus,
      amount: payment.amount,
    });

    // Audit log
    // if(req){
    //   await audit.fromRequest(req, success ? 'PAYMENT_SUCCESS' : 'PAYMENT_FAILED', 'Payment', paymentId);
    // }

    return updated;
  }

  // Get payment by order ID
  async getPaymentByOrderId(orderId) {
    const payment = await PaymentRepository.findByOrderId(orderId);
    if (!payment) {
      throw new AppError('Aucun paiement trouvé pour cette commande', 404);
    }
    return payment;
  }

  // Get payment by ID
  async getPaymentById(id) {
    const payment = await PaymentRepository.findById(id);
    if (!payment) {
      throw new AppError('Paiement non trouvé', 404);
    }
    return payment;
  }

  // Get pending payments
  async getPendingPayments() {
    return PaymentRepository.findByStatus('PENDING');
  }
}

export default new PaymentService();