import prisma from '../config/prisma.js';


class AuditLogRepository {
  // Create audit log
  async create(data) {
    return prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        guestSessionId: data.guestSessionId || null,
        action: data.action,
        entity: data.entity,
        entityId: data.entityId,
        details: data.details || null,
      },
    });
  }

  // Find all audit logs
  async findAll(filters = {}) {
    const where = {};
    
    if (filters.userId) where.userId = filters.userId;
    if (filters.guestSessionId) where.guestSessionId = filters.guestSessionId;
    if (filters.action) where.action = filters.action;
    if (filters.entity) where.entity = filters.entity;
    if (filters.entityId) where.entityId = filters.entityId;
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    return prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: filters.skip || 0,
      take: filters.take || 100,
    });
  }

  // Find by ID
  async findById(id) {
    return prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Find by user
  async findByUserId(userId, limit = 50) {
    return prisma.auditLog.findMany({
      where: { userId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Find by guest session
  async findByGuestSessionId(guestSessionId, limit = 50) {
    return prisma.auditLog.findMany({
      where: { guestSessionId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Find by entity
  async findByEntity(entity, entityId) {
    return prisma.auditLog.findMany({
      where: { entity, entityId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get statistics
  async getStatistics(filters = {}) {
    const where = {};
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    const [total, byAction, byEntity] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { action: true },
      }),
      prisma.auditLog.groupBy({
        by: ['entity'],
        where,
        _count: { entity: true },
      }),
    ]);

    return { total, byAction, byEntity };
  }

  // Delete old logs
  async deleteOldLogs(daysOld = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    
    return prisma.auditLog.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    });
  }
}

export default new AuditLogRepository();