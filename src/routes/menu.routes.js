import { Router } from "express";
import {
    getAllMenuItems,
    getMenuItemById,
    getMenusByCategory,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    toggleOnlineAvailability,
} from "../controllers/menu.controller.js";
import { protect, restrictTo } from "../middlewares/auth.middleware.js";
import { uploadSingle } from "../middlewares/upload.middleware.js";


const router = Router();

// Public routes (anyone can view)
router.get('/', getAllMenuItems);
router.get('/:id', getMenuItemById);
router.get('/category/:categoryId', getMenusByCategory);

// Admin only routes
router.use(protect, restrictTo('ADMIN', 'MANAGER'));
router.post('/', uploadSingle('menus', 'image'), createMenuItem);
router.put('/:id', uploadSingle('menus', 'image'), updateMenuItem);
router.delete('/:id', deleteMenuItem);
router.patch('/:id/toggle-availability', toggleAvailability);
router.patch('/:id/toggle-online', toggleOnlineAvailability);

export default router;