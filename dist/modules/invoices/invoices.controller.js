"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoicesController = exports.InvoicesController = void 0;
const invoices_service_1 = require("./invoices.service");
const response_1 = require("../../utils/response");
class InvoicesController {
    async listInvoices(req, res, next) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
            const page = req.query.page ? parseInt(req.query.page, 10) : 1;
            const result = await invoices_service_1.invoicesService.listInvoices(limit, page);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async getInvoice(req, res, next) {
        try {
            const { id } = req.params;
            const result = await invoices_service_1.invoicesService.getInvoice(id);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.InvoicesController = InvoicesController;
exports.invoicesController = new InvoicesController();
