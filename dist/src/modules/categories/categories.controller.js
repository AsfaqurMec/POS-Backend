"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesController = exports.CategoriesController = void 0;
const categories_service_1 = require("./categories.service");
const response_1 = require("../../utils/response");
class CategoriesController {
    async listCategories(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === "true";
            const categories = await categories_service_1.categoriesService.listCategories(includeInactive);
            return (0, response_1.sendSuccess)(res, categories);
        }
        catch (err) {
            next(err);
        }
    }
    async getCategory(req, res, next) {
        try {
            const { id } = req.params;
            const category = await categories_service_1.categoriesService.getCategory(id);
            return (0, response_1.sendSuccess)(res, category);
        }
        catch (err) {
            next(err);
        }
    }
    async createCategory(req, res, next) {
        try {
            const category = await categories_service_1.categoriesService.createCategory(req.body, req.file);
            return (0, response_1.sendSuccess)(res, category, 201, "Category created successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async updateCategory(req, res, next) {
        try {
            const { id } = req.params;
            const category = await categories_service_1.categoriesService.updateCategory(id, req.body, req.file);
            return (0, response_1.sendSuccess)(res, category, 200, "Category updated successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async toggleStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { active } = req.body;
            const category = await categories_service_1.categoriesService.toggleStatus(id, active);
            return (0, response_1.sendSuccess)(res, category, 200, "Category status updated");
        }
        catch (err) {
            next(err);
        }
    }
    async deleteCategory(req, res, next) {
        try {
            const { id } = req.params;
            const result = await categories_service_1.categoriesService.deleteCategory(id);
            return (0, response_1.sendSuccess)(res, result, 200, "Category deleted successfully");
        }
        catch (err) {
            next(err);
        }
    }
}
exports.CategoriesController = CategoriesController;
exports.categoriesController = new CategoriesController();
