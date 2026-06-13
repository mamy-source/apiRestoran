import { Router } from 'express';
import {
  getAllTables,
  getAvailableTables,
  getTableById,
  createTable,
  updateTable,
  updateTableStatus,
  deleteTable,
} from '../controllers/table.controller.js';
import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const routerTabble = Router();

// Public / Employee routes
routerTabble.get('/', protect, getAllTables);
routerTabble.get('/available', protect, getAvailableTables);
routerTabble.get('/:id', protect, getTableById);

// Status update (Waiter and above)
routerTabble.patch('/:id/status', protect, restrictTo('ADMIN', 'MANAGER', 'WAITER'), updateTableStatus);

// Admin only
routerTabble.post('/', protect, restrictTo('ADMIN', 'MANAGER'), createTable);
routerTabble.put('/:id', protect, restrictTo('ADMIN', 'MANAGER'), updateTable);
routerTabble.delete('/:id', protect, restrictTo('ADMIN'), deleteTable);

export default routerTabble;