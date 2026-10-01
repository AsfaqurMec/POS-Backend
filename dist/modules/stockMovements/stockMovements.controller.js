"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockMovementsController = exports.StockMovementsController = void 0;
const stockMovements_service_1 = require("./stockMovements.service");
const response_1 = require("../../utils/response");
class StockMovementsController {
    async listMovements(req, res, next) {
        try {
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
            const filters = {
                itemId: req.query.itemId,
                variantId: req.query.variantId,
                type: req.query.type,
                search: req.query.search,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                page,
                limit,
            };
            const result = await stockMovements_service_1.stockMovementsService.listMovements(filters);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async createManualMovement(req, res, next) {
        try {
            const userId = req.user.userId;
            const result = await stockMovements_service_1.stockMovementsService.createManualMovement(userId, req.body);
            return (0, response_1.sendSuccess)(res, result, 201, "Stock movement logged successfully");
        }
        catch (err) {
            next(err);
        }
    }
}
exports.StockMovementsController = StockMovementsController;
exports.stockMovementsController = new StockMovementsController();
