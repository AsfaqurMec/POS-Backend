"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessController = exports.BusinessController = void 0;
const business_service_1 = require("./business.service");
const response_1 = require("../../utils/response");
class BusinessController {
    async getBusiness(_req, res, next) {
        try {
            const business = await business_service_1.businessService.getBusiness();
            return (0, response_1.sendSuccess)(res, business);
        }
        catch (err) {
            next(err);
        }
    }
    async updateBusiness(req, res, next) {
        try {
            const updated = await business_service_1.businessService.updateBusiness(req.body, req.file);
            return (0, response_1.sendSuccess)(res, updated, 200, "Business settings updated");
        }
        catch (err) {
            next(err);
        }
    }
}
exports.BusinessController = BusinessController;
exports.businessController = new BusinessController();
