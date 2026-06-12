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


const router = Router();

//Public routes
router.get('/', getAllCategories);
router.get('/:id', getCategoryById);

//Protected routes (Admin and Manager only)
router.use(protect, restrictTo('ADMIN', 'MANAGER'));
router.post('/', uploadSingle('categories', 'image'), createCategory);
router.put('/:id', uploadSingle('categories', 'image'), updateCategory);
router.delete('/:id', deleteCategory);