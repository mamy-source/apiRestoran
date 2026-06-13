import prisma from "../config/prisma.js";


class PaymentRepository {
  // Find payment by order ID
  async findByOrderId(orderId) {
    return prisma.payment.findUnique({
      where: { orderId },
    });
  }

  // Find payment by ID
  async findById(id) {
    return prisma.payment.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  // Create payment
  async create(data) {
    return prisma.payment.create({ data });
  }

  // Update payment
  async update(id, data) {
    return prisma.payment.update({
      where: { id },
      data,
    });
  }

  // Update payment status
  async updateStatus(id, status, paidAt = null) {
    return prisma.payment.update({
      where: { id },
      data: { status, paidAt: paidAt || new Date() },
    });
  }

  // Get payments by status
  async findByStatus(status) {
    return prisma.payment.findMany({
      where: { status },
      include: { order: true },
    });
  }
}

export default new PaymentRepository();