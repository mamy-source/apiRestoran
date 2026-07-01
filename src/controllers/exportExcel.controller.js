import ExportService from '../services/exportExcel.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import { asyncHandler } from '../middlewares/error.middleware.js';

/**
 *Create orders export
 */
export const createOrdersExport = asyncHandler(async (req, res) => {
  const filters = {
    status: req.body.status,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
  };
  
  const result = await ExportService.createOrdersExport(filters);
  sendCreated(res, result, 'Export des commandes créé avec succès');
});

/**
 * Create products export
 */
export const createProductsExport = asyncHandler(async (req, res) => {
  const filters = {
    categoryId: req.body.categoryId,
    available: req.body.available,
  };
  
  const result = await ExportService.createProductsExport(filters);
  sendCreated(res, result, 'Export des produits créé avec succès');
});

/**
 * Create users export
 */
export const createUsersExport = asyncHandler(async (req, res) => {
  const filters = {
    role: req.body.role,
  };
  
  const result = await ExportService.createUsersExport(filters);
  sendCreated(res, result, 'Export des utilisateurs créé avec succès');
});

/**
 * List exports
 */
export const listExports = asyncHandler(async (req, res) => {
  const exports = await ExportService.listExports();
  sendSuccess(res, exports, 'Exports récupérés');
});

/**
 * Download export file
 */
export const downloadExport = asyncHandler(async (req, res) => {
  const { filepath, filename } = await ExportService.downloadExport(req.params.filename);
  
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.sendFile(filepath, { root: '.' });
});

/**
 * Delete export file
 */
export const deleteExport = asyncHandler(async (req, res) => {
  const result = await ExportService.deleteExport(req.params.filename);
  sendSuccess(res, result, 'Export supprimé');
});