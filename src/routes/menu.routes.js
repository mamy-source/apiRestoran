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


const routerMenu = Router();

// Public routes (anyone can view)
routerMenu.get('/', getAllMenuItems);
routerMenu.get('/:id', getMenuItemById);
routerMenu.get('/category/:categoryId', getMenusByCategory);

// Admin only routes
routerMenu.use(protect, restrictTo('ADMIN', 'MANAGER'));
routerMenu.post('/', uploadSingle('menus', 'image'), createMenuItem);
routerMenu.put('/:id', uploadSingle('menus', 'image'), updateMenuItem);
routerMenu.delete('/:id', deleteMenuItem);
routerMenu.patch('/:id/toggle-availability', toggleAvailability);
routerMenu.patch('/:id/toggle-online', toggleOnlineAvailability);

export default routerMenu;