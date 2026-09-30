"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryController = exports.InventoryController = void 0;
const inventory_service_1 = require("./inventory.service");
const response_1 = require("../../utils/response");
class InventoryController {
    async getInventory(req, res, next) {
        try {
            const search = req.query.search;
            const list = await inventory_service_1.inventoryService.getInventory(search);
            return (0, response_1.sendSuccess)(res, list);
        }
        catch (err) {
            next(err);
        }
    }
    async updateStock(req, res, next) {
        try {
            const { id } = req.params;
            const { type, quantity, delta, movementType, reason } = req.body;
            const userId = req.user?.userId;
            const parsedQty = quantity !== undefined ? parseInt(quantity, 10) : undefined;
            const parsedDelta = delta !== undefined ? parseInt(delta, 10) : undefined;
            const result = await inventory_service_1.inventoryService.updateStock(id, type, parsedQty, parsedDelta, movementType, reason, userId);
            return (0, response_1.sendSuccess)(res, result, 200, "Inventory stock updated");
        }
        catch (err) {
            next(err);
        }
    }
}
exports.InventoryController = InventoryController;
exports.inventoryController = new InventoryController();
