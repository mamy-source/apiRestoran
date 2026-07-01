import { Router } from "express";
import { 
  createOrdersExport,
  createProductsExport,
  createUsersExport,
  listExports,
  downloadExport,
  deleteExport,
} from "../controllers/exportExcel.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";

const routerExcel = Router();

// Toutes les routes d'export nécessitent une authentification ADMIN
routerExcel.use(protect, restrictTo('ADMIN', 'MANAGER'));


routerExcel.post('/orders', createOrdersExport);
routerExcel.post('/products', createProductsExport);
routerExcel.post('/users', createUsersExport);

// Exports
routerExcel.get('/', listExports);
routerExcel.get('/download/:filename', downloadExport);
routerExcel.delete('/:filename', deleteExport);

export default routerExcel;