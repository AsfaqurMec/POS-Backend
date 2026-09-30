"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemsController = exports.ItemsController = void 0;
const items_service_1 = require("./items.service");
const response_1 = require("../../utils/response");
class ItemsController {
    async listItems(req, res, next) {
        try {
            const { categoryId, search, includeInactive, variationMode } = req.query;
            const items = await items_service_1.itemsService.listItems({
                categoryId: categoryId,
                search: search,
                activeOnly: includeInactive !== "true",
                variationMode: variationMode,
            });
            return (0, response_1.sendSuccess)(res, items);
        }
        catch (err) {
            next(err);
        }
    }
    async getItem(req, res, next) {
        try {
            const { id } = req.params;
            const item = await items_service_1.itemsService.getItem(id);
            return (0, response_1.sendSuccess)(res, item);
        }
        catch (err) {
            next(err);
        }
    }
    async getItemStats(req, res, next) {
        try {
            const { id } = req.params;
            const result = await items_service_1.itemsService.getItemStats(id);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async createItem(req, res, next) {
        try {
            const item = await items_service_1.itemsService.createItem(req.body, req.file);
            return (0, response_1.sendSuccess)(res, item, 201, "Item created successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async updateItem(req, res, next) {
        try {
            const { id } = req.params;
            const item = await items_service_1.itemsService.updateItem(id, req.body, req.file);
            return (0, response_1.sendSuccess)(res, item, 200, "Item updated successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async toggleStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { active } = req.body;
            const item = await items_service_1.itemsService.toggleStatus(id, active);
            return (0, response_1.sendSuccess)(res, item, 200, "Item status updated");
        }
        catch (err) {
            next(err);
        }
    }
    async deleteItem(req, res, next) {
        try {
            const { id } = req.params;
            const result = await items_service_1.itemsService.deleteItem(id);
            return (0, response_1.sendSuccess)(res, result, 200, "Item deleted successfully");
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ItemsController = ItemsController;
exports.itemsController = new ItemsController();
