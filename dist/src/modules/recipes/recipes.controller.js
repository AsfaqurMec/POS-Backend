"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipesController = exports.RecipesController = void 0;
const recipes_service_1 = require("./recipes.service");
const response_1 = require("../../utils/response");
class RecipesController {
    async listIngredients(_req, res, next) {
        try {
            const result = await recipes_service_1.recipesService.listIngredients();
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async createIngredient(req, res, next) {
        try {
            const result = await recipes_service_1.recipesService.createIngredient(req.body);
            return (0, response_1.sendSuccess)(res, result, 201, "Ingredient added successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async updateIngredient(req, res, next) {
        try {
            const { id } = req.params;
            const result = await recipes_service_1.recipesService.updateIngredient(id, req.body);
            return (0, response_1.sendSuccess)(res, result, 200, "Ingredient updated successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async getRecipe(req, res, next) {
        try {
            const { itemId } = req.params;
            const result = await recipes_service_1.recipesService.getRecipe(itemId);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async setRecipe(req, res, next) {
        try {
            const { itemId } = req.params;
            const { ingredients } = req.body;
            const result = await recipes_service_1.recipesService.setRecipe(itemId, ingredients || []);
            return (0, response_1.sendSuccess)(res, result, 200, "Recipe saved successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async logWastage(req, res, next) {
        try {
            const result = await recipes_service_1.recipesService.logWastage(req.user.userId, req.body);
            return (0, response_1.sendSuccess)(res, result, 201, "Wastage logged successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async listWasteLogs(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const result = await recipes_service_1.recipesService.listWasteLogs(limit, page);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.RecipesController = RecipesController;
exports.recipesController = new RecipesController();
