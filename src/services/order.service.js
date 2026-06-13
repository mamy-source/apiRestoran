import OrderRepository from "../repository/order.repository.js";
import TableRepository from "../repository/table.repository.js";
import MenuRepository from "../repository/menu.repository.js";
import UserRepository from "../repository/user.repository.js";
import { AppError } from "../middlewares/error.middleware.js";
import logger from "../libs/logger.lib.js";


class OrderService {
  // Create order
  async createOrder(data, userId = null, waiterId = null) {
    const { tableId, customerName, customerPhone, deliveryAddress, specialNote, items, source = 'IN_RESTAURANT' } = data;

    // Validate items
    if (!items || items.length === 0) {
      throw new AppError('La commande doit contenir au moins un article', 400);
    }

    // Calculate total and prepare order items
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const menu = await MenuRepository.findById(item.menuId);
      if (!menu) {
        throw new AppError(`Menu ${item.menuId} non trouvé`, 404);
      }
      if (!menu.available) {
        throw new AppError(`Le menu "${menu.name}" n'est pas disponible`, 400);
      }

      const quantity = item.quantity || 1;
      const unitPrice = menu.price;
      const subtotal = unitPrice * quantity;
      total += subtotal;

      orderItems.push({
        menuId: menu.id,
        quantity,
        unitPrice,
        subtotal,
      });
    }

    // Prepare order data
    const orderData = {
      source,
      status: 'PENDING',
      total,
      specialNote,
      items: { create: orderItems },
    };

    // Add table if provided
    if (tableId) {
      const table = await TableRepository.findById(tableId);
      if (!table) {
        throw new AppError('Table non trouvée', 404);
      }
      if (table.status === 'OCCUPIED') {
        throw new AppError('Cette table est déjà occupée', 400);
      }
      orderData.tableId = tableId;
      
      // Update table status to OCCUPIED
      await TableRepository.updateStatus(tableId, 'OCCUPIED');
    }

    // Add waiter if provided
    if (waiterId) {
      const waiter = await UserRepository.findById(waiterId);
      if (!waiter || !['ADMIN', 'MANAGER', 'WAITER'].includes(waiter.role)) {
        throw new AppError('Serveur non trouvé', 404);
      }
      orderData.waiterId = waiterId;
    }

    // Add customer info for online orders
    if (source === 'ONLINE') {
      if (!customerName || !customerPhone) {
        throw new AppError('Nom et téléphone du client requis pour les commandes en ligne', 400);
      }
      orderData.customerName = customerName;
      orderData.customerPhone = customerPhone;
      orderData.deliveryAddress = deliveryAddress;
      
      // If user is authenticated, link to user
      if (userId) {
        orderData.userId = userId;
      }
    }

    const order = await OrderRepository.create(orderData);

    logger.logEvent('ORDER_CREATED', userId || 'guest', {
      orderId: order.id,
      total,
      source,
      itemCount: items.length,
    });

    return order;
  }

  // Get order by ID
  async getOrderById(id) {
    const order = await OrderRepository.findById(id);
    if (!order) {
      throw new AppError('Commande non trouvée', 404);
    }
    return order;
  }

  // Get all orders
  async getAllOrders(filters = {}) {
    return OrderRepository.findAll(filters);
  }

  // Get user orders
  async getUserOrders(userId) {
    return OrderRepository.findByUserId(userId);
  }

  // Update order status
  async updateOrderStatus(id, status, userId, userRole) {
    const order = await OrderRepository.findById(id);
    if (!order) {
      throw new AppError('Commande non trouvée', 404);
    }

    // Permission check
    const isOwner = order.userId === userId;
    const isWaiter = order.waiterId === userId;
    const isAdmin = ['ADMIN', 'MANAGER'].includes(userRole);

    if (!isAdmin && !isOwner && !isWaiter) {
      throw new AppError('Non autorisé à modifier cette commande', 403);
    }

    // Status transition validation
    const validTransitions = {
      PENDING: ['PREPARING', 'CANCELLED'],
      PREPARING: ['READY', 'CANCELLED'],
      READY: ['SERVED', 'CANCELLED'],
      SERVED: ['PAID'],
      PAID: [],
      CANCELLED: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      throw new AppError(`Transition invalide: ${order.status} → ${status}`, 400);
    }

    const updated = await OrderRepository.updateStatus(id, status);

    // If order is completed, update table status to FREE
    if (status === 'PAID' && order.tableId) {
      await TableRepository.updateStatus(order.tableId, 'FREE');
    }

    logger.logEvent('ORDER_STATUS_UPDATED', userId, {
      orderId: id,
      oldStatus: order.status,
      newStatus: status,
    });

    return updated;
  }

  // Update order items (add/remove)
  async updateOrderItems(id, items, userId, userRole) {
    const order = await OrderRepository.findById(id);
    if (!order) {
      throw new AppError('Commande non trouvée', 404);
    }

    // Cannot modify completed orders
    if (['PAID', 'CANCELLED'].includes(order.status)) {
      throw new AppError('Impossible de modifier une commande terminée ou annulée', 400);
    }

    const isOwner = order.userId === userId;
    const isWaiter = order.waiterId === userId;
    const isAdmin = ['ADMIN', 'MANAGER'].includes(userRole);

    if (!isAdmin && !isOwner && !isWaiter) {
      throw new AppError('Non autorisé à modifier cette commande', 403);
    }

    // Recalculate total
    let newTotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menu = await MenuRepository.findById(item.menuId);
      if (!menu) {
        throw new AppError(`Menu ${item.menuId} non trouvé`, 404);
      }

      const quantity = item.quantity || 1;
      const unitPrice = menu.price;
      const subtotal = unitPrice * quantity;
      newTotal += subtotal;

      orderItems.push({
        menuId: menu.id,
        quantity,
        unitPrice,
        subtotal,
      });
    }

    // Update order
    const updated = await OrderRepository.update(id, {
      total: newTotal,
      items: {
        deleteMany: {},
        create: orderItems,
      },
    });

    return updated;
  }

  // Cancel order
  async cancelOrder(id, userId, userRole) {
    const order = await OrderRepository.findById(id);
    if (!order) {
      throw new AppError('Commande non trouvée', 404);
    }

    if (['PAID', 'CANCELLED'].includes(order.status)) {
      throw new AppError('Impossible d\'annuler une commande déjà terminée', 400);
    }

    const isOwner = order.userId === userId;
    const isWaiter = order.waiterId === userId;
    const isAdmin = ['ADMIN', 'MANAGER'].includes(userRole);

    if (!isAdmin && !isOwner && !isWaiter) {
      throw new AppError('Non autorisé à annuler cette commande', 403);
    }

    const cancelled = await OrderRepository.updateStatus(id, 'CANCELLED');

    // Free the table if occupied
    if (order.tableId) {
      await TableRepository.updateStatus(order.tableId, 'FREE');
    }

    logger.logEvent('ORDER_CANCELLED', userId, { orderId: id });
    return cancelled;
  }

  // Get order statistics
  async getStatistics(startDate, endDate) {
    return OrderRepository.getStatistics(startDate, endDate);
  }
}

export default new OrderService();