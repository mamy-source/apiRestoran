import prisma from "../config/prisma.js";


class MenuRepository {
  // Find all menu items
  async findAll(filters = {}) {
    const where = { deletedAt: null };
    
    if (filters.available !== undefined) {
      where.available = filters.available === 'true' || filters.available === true;
    }
    if (filters.availableOnline !== undefined) {
      where.availableOnline = filters.availableOnline === 'true' || filters.availableOnline === true;
    }
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, lte: 'insensitive' } },
        { description: { contains: filters.search, lte: 'insensitive' } },
      ];
    }

    return prisma.menu.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  // Find menu by ID
  async findById(id) {
    return prisma.menu.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });
  }

  // Find menu by name (for uniqueness check)
  async findByName(name) {
    return prisma.menu.findFirst({
      where: { 
        name: { equals: name, lte: 'insensitive' },
        deletedAt: null,
      },
    });
  }

  // Create new menu
  async create(data) {
    return prisma.menu.create({ data });
  }

  // Update menu
  async update(id, data) {
    return prisma.menu.update({
      where: { id },
      data,
    });
  }

  // Soft delete menu
  async softDelete(id) {
    return prisma.menu.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Count menus by category
  async countByCategory(categoryId) {
    return prisma.menu.count({
      where: { categoryId, deletedAt: null },
    });
  }
}

export default new MenuRepository();