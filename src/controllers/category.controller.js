import CategoryService from "../services/category.service.js";
import { sendSuccess, sendCreated } from "../utils/response.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import { categorySchema, validate } from "../validations/category.validators.js";

//get all categories
export const getAllCategories = asyncHandler(async(req, res) =>{
    const categories = await CategoryService.getAllCategory();
    sendSuccess(res, categories, "List of category");
});

//get category by id
export const getCategoryById = asyncHandler(async(req, res) =>{
    const category = await CategoryService.getCategoryById(req.params.id);
    sendSuccess(res, category, 'Category');
})

//create category
export const createCategory = asyncHandler(async(req, res) =>{
    const {valid, errors, data} = validate(categorySchema, req.body);
    if(!valid){
        return res.status(400).json({
            success: false,
        message: 'Validation error',
        errors,
        });
    }
    const result = await CategoryService.createCategory(data, req.file);
    return sendCreated(res, result, 'Category created with success');
});

//update category
export const updateCategory = asyncHandler(async(req, res) =>{
    const catId = req.category.id;
    const categoryFile = req.file;

    const valid = categorySchema.safeParse(req.body);
    if (!valid.success) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors,
        });
    }
    const result = await CategoryService.updateCategory(
        catId,
        valid.data,
        categoryFile
    );
    sendSuccess(res, result, 'Category updated with sucess');
})

//delete category
export const deleteCategory = asyncHandler(async(req, res) =>{
    await CategoryService.deleteCategory(req.params.id);
    sendSuccess(res, null, 'Category deleted with sucess');
});

