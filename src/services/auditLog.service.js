import AuditLogRepository from '../repository/auditLog.repository.js';
import { AppError } from '../middlewares/error.middleware.js';
import logger from '../libs/logger.lib.js';

class AuditLogService {
  async createLog(data) {
    try {
      const { userId, guestSessionId, action, entity, entityId, details = null } = data;

      const logData = {
        action,
        entity,
        entityId,
      };

      if (userId) logData.userId = userId;
      if (guestSessionId) logData.guestSessionId = guestSessionId;
      if (details) {
        logData.details = typeof details === 'string' ? details : JSON.stringify(details);
      }

      const log = await AuditLogRepository.create(logData);

      logger.info(`AUDIT: ${action} on ${entity} ${entityId}`, {
        userId: userId || guestSessionId,
        action,
        entity,
        entityId,
      });

      return log;
    } catch (error) {
      console.error('❌ Audit log error:', error.message);
      return null;
    }
  }

  async getAllLogs(filters = {}) {
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await AuditLogRepository.findAll({
      ...filters,
      skip,
      take: limit,
    });

    const formattedLogs = logs.map(log => {
      let details = null;
      if (log.details) {
        try {
          details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
        } catch {
          details = log.details;
        }
      }

      return {
        id: log.id,
        user: log.user ? {
          id: log.user.id,
          fullName: log.user.fullName,
          email: log.user.email,
          role: log.user.role,
        } : null,
        guestSessionId: log.guestSessionId,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        details: details,
        message: this.formatAuditMessage(log),
        createdAt: log.createdAt,
      };
    });

    const total = await AuditLogRepository.getStatistics(filters);

    return {
      logs: formattedLogs,
      pagination: {
        page,
        limit,
        total: total.total,
        pages: Math.ceil(total.total / limit),
      },
    };
  }

  async getLogById(id) {
    const log = await AuditLogRepository.findById(id);
    if (!log) {
      throw new AppError('Log non trouvé', 404);
    }

    let details = null;
    if (log.details) {
      try {
        details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
      } catch {
        details = log.details;
      }
    }

    return {
      id: log.id,
      user: log.user ? {
        id: log.user.id,
        fullName: log.user.fullName,
        email: log.user.email,
        role: log.user.role,
      } : null,
      guestSessionId: log.guestSessionId,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      details: details,
      message: this.formatAuditMessage(log),
      createdAt: log.createdAt,
    };
  }

  async getUserLogs(userId, limit = 50) {
    const logs = await AuditLogRepository.findByUserId(userId, limit);
    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
      message: this.formatAuditMessage(log),
    }));
  }

  async getGuestLogs(guestSessionId, limit = 50) {
    const logs = await AuditLogRepository.findByGuestSessionId(guestSessionId, limit);
    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
      message: this.formatAuditMessage(log),
    }));
  }

  async getEntityLogs(entity, entityId) {
    const logs = await AuditLogRepository.findByEntity(entity, entityId);
    return logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
      message: this.formatAuditMessage(log),
    }));
  }

  async getStatistics(startDate, endDate) {
    return AuditLogRepository.getStatistics({ startDate, endDate });
  }

  async cleanOldLogs(daysOld = 90) {
    const result = await AuditLogRepository.deleteOldLogs(daysOld);
    logger.info(`Cleaned ${result.count} old audit logs (older than ${daysOld} days)`);
    return { deletedCount: result.count };
  }

 
  formatAuditMessage(log) {
    const user = log.user?.fullName || log.user?.email || 'Inconnu';
    
    const actionMap = {
      'CREATE': 'a créé',
      'UPDATE': 'a modifié',
      'DELETE': 'a supprimé',
      'LOGIN': 's\'est connecté',
      'LOGOUT': 's\'est déconnecté',
      'REGISTER': 's\'est inscrit',
      'REFRESH_TOKEN': 'a rafraîchi son token',
      'UPGRADE_GUEST_TO_CLIENT': 'est devenu client',
      'PAYMENT_SUCCESS': 'a payé avec succès',
      'PAYMENT_FAILED': 'a échoué le paiement',
      'CANCEL_ORDER': 'a annulé la commande',
      'UPDATE_STATUS': 'a changé le statut',
    };
    
    const actionText = actionMap[log.action] || `a fait ${log.action}`;
    
    let entityName = log.entityId;
    if (log.details) {
      try {
        const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
        if (details?.entityName) entityName = details.entityName;
        else if (details?.name) entityName = details.name;
        else if (details?.fullName) entityName = details.fullName;
        else if (details?.email) entityName = details.email;
        else if (details?.title) entityName = details.title;
      } catch {}
    }
    
    return `${user} ${actionText} ${log.entity} "${entityName}" (ID: ${log.entityId})`;
  }
}

export default new AuditLogService();