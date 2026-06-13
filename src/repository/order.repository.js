import prisma from '../config/prisma.js';

class OrderRepository {
  // Find all orders
  async findAll(filters = {}) {
    const where = {};
    
    if (filters.status) where.status = filters.status;
    if (filters.source) where.source = filters.source;
    if (filters.userId) where.userId = filters.userId;
    if (filters.tableId) where.tableId = filters.tableId;
    if (filters.waiterId) where.waiterId = filters.waiterId;
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.createdAt.lte = new Date(filters.dateTo);
    }

    return prisma.order.findMany({
      where,
      include: {
        table: true,
        waiter: { select: { id: true, fullName: true } },
        user: { select: { id: true, fullName: true, email: true } },
        items: { include: { menu: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Find order by ID
  async findById(id) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        waiter: { select: { id: true, fullName: true, email: true } },
        user: { select: { id: true, fullName: true, email: true, phoneNumber: true } },
        items: { include: { menu: { include: { category: true } } } },
        payment: true,
        invoice: true,
      },
    });
  }

  // Find orders by user ID
  async findByUserId(userId, limit = 50) {
    return prisma.order.findMany({
      where: { userId, status: { not: 'CANCELLED' } },
      include: {
        items: { include: { menu: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Create order
  async create(data) {
    return prisma.order.create({
      data,
      include: { items: true },
    });
  }

  // Update order
  async update(id, data) {
    return prisma.order.update({
      where: { id },
      data,
    });
  }

  // Update order status
  async updateStatus(id, status) {
    return prisma.order.update({
      where: { id },
      data: { status },
    });
  }

  // Update order total
  async updateTotal(id, total) {
    return prisma.order.update({
      where: { id },
      data: { total },
    });
  }

  // Get order statistics
  async getStatistics(startDate, endDate) {
    const where = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const [stats, byStatus, bySource] = await Promise.all([
      prisma.order.aggregate({
        where,
        _sum: { total: true },
        _count: { id: true },
      }),
      prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { id: true },
        _sum: { total: true },
      }),
      prisma.order.groupBy({
        by: ['source'],
        where,
        _count: { id: true },
      }),
    ]);

    return { stats, byStatus, bySource };
  }
}

export default new OrderRepository();