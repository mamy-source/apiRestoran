import MenuService from "../services/menu.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { createMenuSchema, updateMenuSchema } from "../validations/menu.validators.js";


// Get all menu items
export const getAllMenuItems = asyncHandler(async (req, res) => {
  const filters = {
    available: req.query.available,
    availableOnline: req.query.online,
    categoryId: req.query.categoryId,
    search: req.query.search,
  };
  
  const menus = await MenuService.getAllMenuItems(filters);
  sendSuccess(res, menus, 'Menus récupérés avec succès');
});

// Get menu by ID
export const getMenuItemById = asyncHandler(async (req, res) => {
  const menu = await MenuService.getMenuItemById(req.params.id);
  sendSuccess(res, menu, 'Menu récupéré avec succès');
});

// Get menus by category
export const getMenusByCategory = asyncHandler(async (req, res) => {
  const menus = await MenuService.getMenusByCategory(req.params.categoryId);
  sendSuccess(res, menus, 'Menus de la catégorie récupérés');
});

// Create menu item (Admin only)
export const createMenuItem = asyncHandler(async (req, res) => {
  const validation = createMenuSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: validation.error.errors,
    });
  }

  const menu = await MenuService.createMenuItem(validation.data, req.file);
  sendCreated(res, menu, 'Menu créé avec succès');
});

// Update menu item (Admin only)
export const updateMenuItem = asyncHandler(async (req, res) => {
  const validation = updateMenuSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: validation.error.errors,
    });
  }

  const menu = await MenuService.updateMenuItem(req.params.id, validation.data, req.file);
  sendSuccess(res, menu, 'Menu mis à jour avec succès');
});

// Delete menu item (Admin only)
export const deleteMenuItem = asyncHandler(async (req, res) => {
  await MenuService.deleteMenuItem(req.params.id);
  sendSuccess(res, null, 'Menu supprimé avec succès');
});

// Toggle availability (Admin only)
export const toggleAvailability = asyncHandler(async (req, res) => {
  const menu = await MenuService.toggleAvailability(req.params.id);
  sendSuccess(res, menu, `Menu ${menu.available ? 'disponible' : 'indisponible'}`);
});

// Toggle online availability (Admin only)
export const toggleOnlineAvailability = asyncHandler(async (req, res) => {
  const menu = await MenuService.toggleOnlineAvailability(req.params.id);
  sendSuccess(res, menu, `Menu ${menu.availableOnline ? 'disponible en ligne' : 'indisponible en ligne'}`);
});