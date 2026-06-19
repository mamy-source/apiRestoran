import { Router } from 'express';
import {
  getAllLogs,
  getLogById,
  getUserLogs,
  getGuestLogs,
  getEntityLogs,
  getStatistics,
  cleanOldLogs,
} from '../controllers/auditLog.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const routerAudit = Router();

// Toutes les routes audit nécessitent une authentification ADMIN
routerAudit.use(protect, restrictTo('ADMIN'));

// Routes principales
routerAudit.get('/', getAllLogs);
routerAudit.get('/statistics', getStatistics);
routerAudit.get('/clean', cleanOldLogs);
routerAudit.get('/:id', getLogById);

// Routes par filtre
routerAudit.get('/user/:userId', getUserLogs);
routerAudit.get('/guest/:guestSessionId', getGuestLogs);
routerAudit.get('/entity/:entity/:entityId', getEntityLogs);

export default routerAudit;