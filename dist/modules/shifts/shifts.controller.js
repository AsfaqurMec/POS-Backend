"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shiftsController = exports.ShiftsController = void 0;
const shifts_service_1 = require("./shifts.service");
const response_1 = require("../../utils/response");
class ShiftsController {
    async openShift(req, res, next) {
        try {
            const { startFloat } = req.body;
            const result = await shifts_service_1.shiftsService.openShift(req.user.userId, Number(startFloat) || 0);
            return (0, response_1.sendSuccess)(res, result, 201, "Shift opened successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async getCurrentShift(req, res, next) {
        try {
            const result = await shifts_service_1.shiftsService.getCurrentShift(req.user.userId);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async addCashMovement(req, res, next) {
        try {
            const { shiftId, type, amount, reason } = req.body;
            const result = await shifts_service_1.shiftsService.addCashMovement(req.user.userId, shiftId, type, Number(amount), reason);
            return (0, response_1.sendSuccess)(res, result, 201, "Cash movement recorded");
        }
        catch (err) {
            next(err);
        }
    }
    async closeShift(req, res, next) {
        try {
            const { shiftId, actualCash, notes } = req.body;
            const result = await shifts_service_1.shiftsService.closeShift(req.user.userId, shiftId, Number(actualCash) || 0, notes);
            return (0, response_1.sendSuccess)(res, result, 200, "Shift closed and Z-Report generated");
        }
        catch (err) {
            next(err);
        }
    }
    async getShiftReport(req, res, next) {
        try {
            const { id } = req.params;
            const result = await shifts_service_1.shiftsService.getShiftReport(id);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async getAllShifts(req, res, next) {
        try {
            const { page, limit, status, startDate, endDate, userId, search } = req.query;
            const result = await shifts_service_1.shiftsService.getAllShifts({
                page: page ? Number(page) : undefined,
                limit: limit ? Number(limit) : undefined,
                status: status,
                startDate: startDate,
                endDate: endDate,
                userId: userId,
                search: search,
            });
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async getShiftById(req, res, next) {
        try {
            const { id } = req.params;
            const result = await shifts_service_1.shiftsService.getShiftById(id);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ShiftsController = ShiftsController;
exports.shiftsController = new ShiftsController();
