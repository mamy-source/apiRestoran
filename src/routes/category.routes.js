import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js"; 
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";


const routerCategory = Router();

//Public routes
routerCategory.get('/', getAllCategories);
routerCategory.get('/:id', getCategoryById);

//Protected routes (Admin and Manager only)
routerCategory.use(protect, restrictTo('ADMIN', 'MANAGER'));
routerCategory.post('/', uploadSingle('categories', 'image'), createCategory);
routerCategory.put('/:id', uploadSingle('categories', 'image'), updateCategory);
routerCategory.delete('/:id', deleteCategory);

export default routerCategory;