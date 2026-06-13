import OrderService from "../services/order.service.js";
import { sendCreated, sendPaginated, sendSuccess } from "../utils/response.js";
import { asyncHandler } from "../middlewares/error.middleware.js";  
import { createOrderSchema, updateOrderStatusSchema, updateOrderItemsSchema } from "../validations/order.validators.js";




// Create order
export const createOrder = asyncHandler(async (req, res) => {
  const validation = createOrderSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, errors: validation.error.errors });
  }

  const userId = req.user?.id;
  const waiterId = req.user?.role === 'WAITER' ? req.user.id : null;
  
  const order = await OrderService.createOrder(validation.data, userId, waiterId);
  sendCreated(res, order, 'Commande créée avec succès');
});

// Get all orders (Admin/Manager/Waiter)
export const getAllOrders = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    source: req.query.source,
    userId: req.query.userId,
    tableId: req.query.tableId,
    waiterId: req.query.waiterId,
    dateFrom: req.query.dateFrom,
    dateTo: req.query.dateTo,
  };
  
  const orders = await OrderService.getAllOrders(filters);
  sendSuccess(res, orders, 'Commandes récupérées');
});

// Get order by ID
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await OrderService.getOrderById(req.params.id);
  sendSuccess(res, order, 'Commande récupérée');
});

// Get user orders (for authenticated users)
export const getUserOrders = asyncHandler(async (req, res) => {
  const orders = await OrderService.getUserOrders(req.user.id);
  sendSuccess(res, orders, 'Vos commandes');
});

// Update order status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const validation = updateOrderStatusSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, errors: validation.error.errors });
  }

  const order = await OrderService.updateOrderStatus(
    req.params.id, 
    validation.data.status,
    req.user.id,
    req.user.role
  );
  sendSuccess(res, order, 'Statut mis à jour');
});

// Update order items
export const updateOrderItems = asyncHandler(async (req, res) => {
  const validation = updateOrderItemsSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, errors: validation.error.errors });
  }

  const order = await OrderService.updateOrderItems(
    req.params.id,
    validation.data.items,
    req.user.id,
    req.user.role
  );
  sendSuccess(res, order, 'Commande mise à jour');
});

// Cancel order
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await OrderService.cancelOrder(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, order, 'Commande annulée');
});

// Order statistics (Admin/Manager)
export const getOrderStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const stats = await OrderService.getStatistics(startDate, endDate);
  sendSuccess(res, stats, 'Statistiques des commandes');
});