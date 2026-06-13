import TableRepository from "../repository/table.repository.js";
import AppError from '../middlewares/error.middleware.js';
import logger from '../libs/logger.lib.js';


class TableService {
  // Create table
  async createTable(data) {
    // Check if table number already exists
    const existing = await TableRepository.findByNumber(data.number);
    if (existing) {
      throw new AppError(`La table numéro ${data.number} existe déjà`, 400);
    }

    const table = await TableRepository.create({
      number: data.number,
      capacity: data.capacity,
      status: data.status || 'FREE',
    });

    logger.logEvent('TABLE_CREATED', null, { 
      tableId: table.id, 
      number: table.number 
    });

    return table;
  }

  // Update table
  async updateTable(id, data) {
    const table = await TableRepository.findById(id);
    if (!table) {
      throw new AppError('Table non trouvée', 404);
    }

    // Check if new number already exists
    if (data.number && data.number !== table.number) {
      const existing = await TableRepository.findByNumber(data.number);
      if (existing) {
        throw new AppError(`La table numéro ${data.number} existe déjà`, 400);
      }
    }

    const updated = await TableRepository.update(id, {
      number: data.number || table.number,
      capacity: data.capacity || table.capacity,
      status: data.status || table.status,
    });

    logger.logEvent('TABLE_UPDATED', null, { tableId: id });
    return updated;
  }

  // Get all tables
  async getAllTables(filters = {}) {
    return TableRepository.findAll(filters);
  }

  // Get table by ID
  async getTableById(id) {
    const table = await TableRepository.findById(id);
    if (!table) {
      throw new AppError('Table non trouvée', 404);
    }
    return table;
  }

  // Get available tables
  async getAvailableTables(capacity = null) {
    const filters = { status: 'FREE' };
    if (capacity) {
      filters.capacity = capacity;
    }
    return TableRepository.findAll(filters);
  }

  // Update table status
  async updateTableStatus(id, status) {
    const table = await TableRepository.findById(id);
    if (!table) {
      throw new AppError('Table non trouvée', 404);
    }

    const updated = await TableRepository.updateStatus(id, status);
    
    logger.logEvent('TABLE_STATUS_UPDATED', null, { 
      tableId: id, 
      oldStatus: table.status, 
      newStatus: status 
    });

    return updated;
  }

  // Soft delete table
  async deleteTable(id) {
    const table = await TableRepository.findById(id);
    if (!table) {
      throw new AppError('Table non trouvée', 404);
    }

    // Check if table has active orders
    const activeOrders = table.orders?.filter(o => o.status !== 'PAID' && o.status !== 'CANCELLED');
    if (activeOrders && activeOrders.length > 0) {
      throw new AppError('Impossible de supprimer une table avec des commandes actives', 400);
    }

    await TableRepository.delete(id);
    logger.logEvent('TABLE_DELETED', null, { tableId: id });
    return true;
  }
}

export default new TableService();