import prisma from "../config/prisma.js";


class UserRepository {
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        role: true,
        password: true,
        loyaltyPoints: true,
        totalSpent: true,
        orderCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(filters = {}) {
    const where = { deletedAt: null };
    
    if (filters.role) {
      where.role = filters.role;
    }
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search } },
        { email: { contains: filters.search } },
      ];
    }

    return prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        role: true,
        loyaltyPoints: true,
        totalSpent: true,
        orderCount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        avatar: true,
        role: true,
        loyaltyPoints: true,
        totalSpent: true,
        orderCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async softDelete(id) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export default new UserRepository();