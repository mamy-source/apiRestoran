import prisma from "../config/prisma.js";


class InvoiceRepository {
  // Find invoice by ID
  async findById(id) {
    return prisma.invoice.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: { menu: true },
            },
            user: true,
            payment: true,
            table: true,
            waiter: { select: { id: true, fullName: true } },
          },
        },
      },
    });
  }

  // Find invoice by order ID
  async findByOrderId(orderId) {
    return prisma.invoice.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            items: { include: { menu: true } },
            user: true,
            payment: true,
          },
        },
      },
    });
  }

  // Find invoice by invoice number
  async findByInvoiceNumber(invoiceNumber) {
    return prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        order: {
          include: {
            items: { include: { menu: true } },
            user: true,
          },
        },
      },
    });
  }

  // Find all invoices
  async findAll(filters = {}) {
    const where = {};
    
    if (filters.startDate || filters.endDate) {
      where.generatedAt = {};
      if (filters.startDate) where.generatedAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.generatedAt.lte = new Date(filters.endDate);
    }
    if (filters.orderId) where.orderId = filters.orderId;

    return prisma.invoice.findMany({
      where,
      include: {
        order: {
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            items: { take: 1 },
          },
        },
      },
      orderBy: { generatedAt: 'desc' },
    });
  }

  // Create invoice
  async create(data) {
    return prisma.invoice.create({ data });
  }

  // Update invoice
  async update(id, data) {
    return prisma.invoice.update({
      where: { id },
      data,
    });
  }

  // Delete invoice
  async delete(id) {
    return prisma.invoice.delete({ where: { id } });
  }

  // Get last invoice number
  async getLastInvoiceNumber() {
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { generatedAt: 'desc' },
      select: { invoiceNumber: true },
    });
    
    return lastInvoice?.invoiceNumber || null;
  }

  // Count invoices
  async count() {
    return prisma.invoice.count();
  }
}

export default new InvoiceRepository();