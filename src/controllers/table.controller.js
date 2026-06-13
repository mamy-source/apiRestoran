import TableService from "../services/table.service.js";
import {sendSuccess, sendCreated} from "../utils/response.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { createTableSchema, updateTableSchema, updateTableStatusSchema } from "../validations/table.validators.js";



// Get all tables
export const getAllTables = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    capacity: req.query.capacity,
  };
  const tables = await TableService.getAllTables(filters);
  sendSuccess(res, tables, 'Tables récupérées avec succès');
});

// Get available tables
export const getAvailableTables = asyncHandler(async (req, res) => {
  const tables = await TableService.getAvailableTables(req.query.capacity);
  sendSuccess(res, tables, 'Tables disponibles récupérées');
});

// Get table by ID
export const getTableById = asyncHandler(async (req, res) => {
  const table = await TableService.getTableById(req.params.id);
  sendSuccess(res, table, 'Table récupérée avec succès');
});

// Create table (Admin only)
export const createTable = asyncHandler(async (req, res) => {
  const validation = createTableSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, errors: validation.error.errors });
  }

  const table = await TableService.createTable(validation.data);
  sendCreated(res, table, 'Table créée avec succès');
});

// Update table (Admin only)
export const updateTable = asyncHandler(async (req, res) => {
  const validation = updateTableSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, errors: validation.error.errors });
  }

  const table = await TableService.updateTable(req.params.id, validation.data);
  sendSuccess(res, table, 'Table mise à jour avec succès');
});

// Update table status (Waiter/Manager/Admin)
export const updateTableStatus = asyncHandler(async (req, res) => {
  const validation = updateTableStatusSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ success: false, errors: validation.error.errors });
  }

  const table = await TableService.updateTableStatus(req.params.id, validation.data.status);
  sendSuccess(res, table, 'Statut de la table mis à jour');
});

// Delete table (Admin only)
export const deleteTable = asyncHandler(async (req, res) => {
  await TableService.deleteTable(req.params.id);
  sendSuccess(res, null, 'Table supprimée avec succès');
});