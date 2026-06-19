import AuditLogService from '../services/auditLog.service.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middlewares/error.middleware.js';


// Get all logs (Admin only)
export const getAllLogs = asyncHandler(async (req, res) => {
  const filters = {
    userId: req.query.userId,
    action: req.query.action,
    entity: req.query.entity,
    entityId: req.query.entityId,
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    page: req.query.page,
    limit: req.query.limit,
  };
  
  const result = await AuditLogService.getAllLogs(filters);
  sendSuccess(res, result, 'Logs récupérés avec succès');
});

// Get log by ID
export const getLogById = asyncHandler(async (req, res) => {
  const log = await AuditLogService.getLogById(req.params.id);
  sendSuccess(res, log, 'Log récupéré');
});

// Get logs by user
export const getUserLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLogService.getUserLogs(req.params.userId, req.query.limit);
  sendSuccess(res, logs, `Logs de l'utilisateur ${req.params.userId}`);
});

// Get logs by guest
export const getGuestLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLogService.getGuestLogs(req.params.guestSessionId, req.query.limit);
  sendSuccess(res, logs, 'Logs du guest récupérés');
});

// Get logs by entity
export const getEntityLogs = asyncHandler(async (req, res) => {
  const logs = await AuditLogService.getEntityLogs(req.params.entity, req.params.entityId);
  sendSuccess(res, logs, `Logs de l'entité ${req.params.entity}/${req.params.entityId}`);
});

// Get statistics
export const getStatistics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  const stats = await AuditLogService.getStatistics(startDate, endDate);
  sendSuccess(res, stats, 'Statistiques des logs');
});

// Clean old logs
export const cleanOldLogs = asyncHandler(async (req, res) => {
  const { days = 90 } = req.query;
  const result = await AuditLogService.cleanOldLogs(parseInt(days));
  sendSuccess(res, result, `${result.deletedCount} logs supprimés`);
});