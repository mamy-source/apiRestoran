import prisma from '../config/prisma.js';



class TableRepository {
  // Find all tables
  async findAll(filters = {}) {
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.capacity) {
      where.capacity = { gte: parseInt(filters.capacity) };
    }

    return prisma.restaurantTable.findMany({
      where,
      include: {
        orders: {
          where: { status: { not: 'PAID' } },
          take: 1,
        },
      },
      orderBy: { number: 'asc' },
    });
  }

  // Find table by ID
  async findById(id) {
    return prisma.restaurantTable.findUnique({
      where: { id },
      include: {
        orders: {
          where: { status: { not: 'PAID' } },
          include: {
            items: { include: { menu: true } },
            waiter: true,
          },
        },
      },
    });
  }

  // Find table by number
  async findByNumber(number) {
    return prisma.restaurantTable.findUnique({
      where: { number },
    });
  }

  // Create new table
  async create(data) {
    return prisma.restaurantTable.create({ data });
  }

  // Update table
  async update(id, data) {
    return prisma.restaurantTable.update({
      where: { id },
      data,
    });
  }

  // Delete table
  async delete(id) {
    return prisma.restaurantTable.delete({
      where: { id },
    });
  }

  // Update table status
  async updateStatus(id, status) {
    return prisma.restaurantTable.update({
      where: { id },
      data: { status },
    });
  }
}

export default new TableRepository();