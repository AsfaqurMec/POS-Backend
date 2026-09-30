"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.DashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const response_1 = require("../../utils/response");
class DashboardController {
    async getDashboardStats(req, res, next) {
        try {
            const filter = {
                period: req.query.period,
                startDate: req.query.startDate,
                endDate: req.query.endDate,
            };
            const stats = await dashboard_service_1.dashboardService.getDashboardStats(filter);
            return (0, response_1.sendSuccess)(res, stats);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.DashboardController = DashboardController;
exports.dashboardController = new DashboardController();
