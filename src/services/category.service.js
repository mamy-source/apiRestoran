import { AppError } from "../middlewares/error.middleware.js";
import { processUploadedImage, deleteImage } from "./image.service.js";
import logger from "../libs/logger.lib.js";
import CategoryRepository from "../repository/category.repository.js";
// import audit from "../utils/auditHelper.js";



class CategoryService{
    //get all Category
    async getAllCategory(){
        const categories = await CategoryRepository.getAllCategory();
        return categories;
    }

    //get Category by Id 
    async getCategoryById(catId){
        const category = await CategoryRepository.findCategoryById(catId);
        if (!category){
            throw new AppError('Category not found', 404);

        }
        
        return category;
    }

    //create category
    async createCategory(data, categoryFile){
        if (!data) {
            throw new AppError('Category data is required', 400);
        }
        const existing = await CategoryRepository.findByName(data.name);
        if (existing) {
        throw new AppError('This category is already exists', 400);
        }

        let imageUrl = null;

        if (categoryFile) {
            const processed = await processUploadedImage(categoryFile, {
                width: 400,
                height: 400,
                quality: 80,
            });
            imageUrl = processed.path;
        }
        

        const category = await CategoryRepository.createCategory({
            name: data.name,
            image: imageUrl,
            description: data.description,
        });
        logger.logEvent('CATEGORY_CREATED', null, {
            categoryId: category.id, 
            name: category.name 
        });
        
        // Audit log
        // if(req){
        //     await audit.fromRequest(req, 'CREATE', 'Category', category.id);
        // }
        
        return category;

    }

    //update category
    async updateCategory(catId, data, categoryFile){
        const category = await CategoryRepository.findCategoryById(catId);
        if(!category){
            throw new AppError('Category not found', 404);
        }

        // Check if new name already exists
        if (data.name && data.name !== category.name) {
            const existing = await CategoryRepository.findByName(data.name);
            if (existing) {
            throw new AppError('Cette catégorie existe déjà', 400);
            }
        }
        let imageUrl = category.image;

        if(categoryFile){
            if(category.image){
                deleteImage(category.image);
            }

            const processed = await processUploadedImage(categoryFile, {
                width: 400,
                height: 400,
                quality: 80,
            });
            imageUrl = processed.path;
        }

        const updateCategory = await CategoryRepository.updateCategory(catId, {
            name: data.name,
            description: data.description !== undefined ? data.description : category.description,
            image: imageUrl,
        });
        logger.logEvent('PROFILE_UPDATED', null, {categoryId: catId});
        

        // Audit log
        // if(req){
        //     await audit.fromRequest(req, 'UPDATE', 'Category', catId);
        // }
        return updateCategory;
    }

    //delete category Manager
    async deleteCategory(catId){
        const category = await CategoryRepository.findCategoryById(catId);

        if (!category){
            throw new AppError ('Category not found', 404);
        }
        if(category.image){
            deleteImage(category.image);
        }
        await CategoryRepository.softDelete(catId);
        logger.logEvent('CATEGORY_DELETED', null, {deletedBy: 'MANAGER'});
        
        // // Audit log
        // if(req){
        //     await audit.fromRequest(req, 'DELETE', 'Category', catId);
        // }
        
        return true;
    }
}

export default new CategoryService();