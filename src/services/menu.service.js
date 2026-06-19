import MenuRepository from "../repository/menu.repository.js";
import CategoryRepository from "../repository/category.repository.js";
import { processUploadedImage, deleteImage } from "./image.service.js";
import logger from "../libs/logger.lib.js";
import { AppError } from "../middlewares/error.middleware.js";
// import audit from "../utils/auditHelper.js";


class MenuService {
  // Create menu item
  async createMenuItem(data, imageFile = null) {
    // Check if category exists
    const category = await CategoryRepository.findCategoryById(data.categoryId);
    if (!category) {
      throw new AppError('Catégorie non trouvée', 404);
    }

    // Check if menu name already exists
    const existing = await MenuRepository.findByName(data.name);
    if (existing) {
      throw new AppError('Un menu avec ce nom existe déjà', 400);
    }

    let imageUrl = null;
    if (imageFile) {
      const processed = await processUploadedImage(imageFile, {
        width: 500,
        height: 500,
        quality: 80,
      });
      imageUrl = processed.path;
    }

    const menu = await MenuRepository.create({
      name: data.name,
      description: data.description,
      price: data.price,
      available: data.available !== undefined ? data.available : true,
      availableOnline: data.availableOnline !== undefined ? data.availableOnline : true,
      categoryId: data.categoryId,
      image: imageUrl,
    });

    logger.logEvent('MENU_CREATED', null, { 
      menuId: menu.id, 
      name: menu.name,
      categoryId: data.categoryId,
    });

    // Audit log
    // if(req){
    //   await audit.fromRequest(req, 'CREATE', 'Menu', menu.id);
    // }
    return menu;
  }

  // Update menu item
  async updateMenuItem(id, data, imageFile = null) {
    const menu = await MenuRepository.findById(id);
    if (!menu) {
      throw new AppError('Menu non trouvé', 404);
    }

    // Check if category exists if changed
    if (data.categoryId && data.categoryId !== menu.categoryId) {
      const category = await CategoryRepository.findCategoryById(data.categoryId);
      if (!category) {
        throw new AppError('Catégorie non trouvée', 404);
      }
    }

    // Check if new name already exists
    if (data.name && data.name !== menu.name) {
      const existing = await MenuRepository.findByName(data.name);
      if (existing) {
        throw new AppError('Un menu avec ce nom existe déjà', 400);
      }
    }

    let imageUrl = menu.image;
    
    if (imageFile) {
      // Delete old image
      if (menu.image) {
        deleteImage(menu.image);
      }
      
      const processed = await processUploadedImage(imageFile, {
        width: 500,
        height: 500,
        quality: 80,
      });
      imageUrl = processed.path;
    }

    const updated = await MenuRepository.update(id, {
      name: data.name || menu.name,
      description: data.description !== undefined ? data.description : menu.description,
      price: data.price !== undefined ? data.price : menu.price,
      available: data.available !== undefined ? data.available : menu.available,
      availableOnline: data.availableOnline !== undefined ? data.availableOnline : menu.availableOnline,
      categoryId: data.categoryId || menu.categoryId,
      image: imageUrl,
    });

    logger.logEvent('MENU_UPDATED', null, { menuId: id });
    
    // Audit log
    // if(req){
    //   await audit.fromRequest(req, 'UPDATE', 'Menu', id);
    // }

    return updated;
  }

  // Get all menu items
  async getAllMenuItems(filters = {}) {
    return MenuRepository.findAll(filters);
  }

  // Get menu by ID
  async getMenuItemById(id) {
    const menu = await MenuRepository.findById(id);
    if (!menu) {
      throw new AppError('Menu non trouvé', 404);
    }
    return menu;
  }

  // Get menus by category
  async getMenusByCategory(categoryId) {
    const category = await CategoryRepository.findCategoryById(categoryId);
    if (!category) {
      throw new AppError('Catégorie non trouvée', 404);
    }
    
    return MenuRepository.findAll({ categoryId });
  }

  // Delete menu item
  async deleteMenuItem(id) {
    const menu = await MenuRepository.findById(id);
    if (!menu) {
      throw new AppError('Menu non trouvé', 404);
    }

    // Delete associated image
    if (menu.image) {
      deleteImage(menu.image);
    }

    await MenuRepository.softDelete(id);
    logger.logEvent('MENU_DELETED', null, { menuId: id });
    
    // Audit log
    // if(req){
    //   await audit.fromRequest(req, 'DELETE', 'Menu', id);
    // }  

    return true;
  }

  // Toggle menu availability
  async toggleAvailability(id) {
    const menu = await MenuRepository.findById(id);
    if (!menu) {
      throw new AppError('Menu non trouvé', 404);
    }

    const updated = await MenuRepository.update(id, {
      available: !menu.available,
    });

    logger.logEvent('MENU_AVAILABILITY_TOGGLED', null, { 
      menuId: id, 
      available: updated.available 
    });

    // Audit log
    // if(req){
    //   await audit.fromRequest(req, 'TOGGLE_AVAILABILITY', 'Menu', id);
    //   await audit.fromRequest(req, '', 'Menu', id);
    // }
    return updated;
  }

  // Toggle online availability
  async toggleOnlineAvailability(id) {
    const menu = await MenuRepository.findById(id);
    if (!menu) {
      throw new AppError('Menu non trouvé', 404);
    }

    const updated = await MenuRepository.update(id, {
      availableOnline: !menu.availableOnline,
    });

    // Audit log
    // if(req){
    //   await audit.fromRequest(req, 'TOGGLE_ONLINE_AVAILABILITY', 'Menu', id);

    // }
    return updated;
  }
}

export default new MenuService();