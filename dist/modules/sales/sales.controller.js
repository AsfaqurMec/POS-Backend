"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesController = exports.SalesController = void 0;
const sales_service_1 = require("./sales.service");
const response_1 = require("../../utils/response");
class SalesController {
    async createSale(req, res, next) {
        try {
            const result = await sales_service_1.salesService.createSale(req.user.userId, req.body);
            return (0, response_1.sendSuccess)(res, result, 201, "Sale completed successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async listSales(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const filters = {
                search: req.query.search,
                orderType: req.query.orderType,
                paymentMethod: req.query.paymentMethod,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
                sortBy: req.query.sortBy,
            };
            const result = await sales_service_1.salesService.listSales(limit, page, filters);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async getSale(req, res, next) {
        try {
            const { id } = req.params;
            const result = await sales_service_1.salesService.getSale(id);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async voidSale(req, res, next) {
        try {
            const { id } = req.params;
            const { voidReason, restock, managerToken: bodyToken } = req.body;
            const managerToken = req.headers["x-manager-token"] || bodyToken;
            const result = await sales_service_1.salesService.voidSale(req.user, id, voidReason, restock !== false, managerToken);
            return (0, response_1.sendSuccess)(res, result, 200, "Sale voided and refunded successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async holdOrder(req, res, next) {
        try {
            const result = await sales_service_1.salesService.holdOrder(req.user.userId, req.body);
            return (0, response_1.sendSuccess)(res, result, 201, "Order held successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async getHeldOrders(_req, res, next) {
        try {
            const result = await sales_service_1.salesService.getHeldOrders();
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async deleteHeldOrder(req, res, next) {
        try {
            const { id } = req.params;
            const result = await sales_service_1.salesService.deleteHeldOrder(id);
            return (0, response_1.sendSuccess)(res, result, 200, "Held order removed");
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SalesController = SalesController;
exports.salesController = new SalesController();
