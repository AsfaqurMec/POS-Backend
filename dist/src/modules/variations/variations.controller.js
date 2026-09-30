"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.variationsController = exports.VariationsController = void 0;
const variations_service_1 = require("./variations.service");
const response_1 = require("../../utils/response");
class VariationsController {
    // Groups
    async listGroups(req, res, next) {
        try {
            const { id } = req.params;
            const groups = await variations_service_1.variationsService.listGroups(id);
            return (0, response_1.sendSuccess)(res, groups);
        }
        catch (err) {
            next(err);
        }
    }
    async createGroup(req, res, next) {
        try {
            const { id } = req.params;
            const group = await variations_service_1.variationsService.createGroup(id, req.body);
            return (0, response_1.sendSuccess)(res, group, 201, "Variation group created");
        }
        catch (err) {
            next(err);
        }
    }
    async updateGroup(req, res, next) {
        try {
            const { id } = req.params;
            const group = await variations_service_1.variationsService.updateGroup(id, req.body);
            return (0, response_1.sendSuccess)(res, group, 200, "Variation group updated");
        }
        catch (err) {
            next(err);
        }
    }
    async deleteGroup(req, res, next) {
        try {
            const { id } = req.params;
            const result = await variations_service_1.variationsService.deleteGroup(id);
            return (0, response_1.sendSuccess)(res, result, 200, "Variation group deleted");
        }
        catch (err) {
            next(err);
        }
    }
    // Options
    async createOption(req, res, next) {
        try {
            const { id } = req.params;
            const option = await variations_service_1.variationsService.createOption(id, req.body);
            return (0, response_1.sendSuccess)(res, option, 201, "Option created");
        }
        catch (err) {
            next(err);
        }
    }
    async updateOption(req, res, next) {
        try {
            const { id } = req.params;
            const option = await variations_service_1.variationsService.updateOption(id, req.body);
            return (0, response_1.sendSuccess)(res, option, 200, "Option updated");
        }
        catch (err) {
            next(err);
        }
    }
    async deleteOption(req, res, next) {
        try {
            const { id } = req.params;
            const result = await variations_service_1.variationsService.deleteOption(id);
            return (0, response_1.sendSuccess)(res, result, 200, "Option deleted");
        }
        catch (err) {
            next(err);
        }
    }
    // Variants
    async listVariants(req, res, next) {
        try {
            const { id } = req.params;
            const variants = await variations_service_1.variationsService.listVariants(id);
            return (0, response_1.sendSuccess)(res, variants);
        }
        catch (err) {
            next(err);
        }
    }
    async createVariant(req, res, next) {
        try {
            const { id } = req.params;
            const variant = await variations_service_1.variationsService.createVariant(id, req.body);
            return (0, response_1.sendSuccess)(res, variant, 201, "Variant created");
        }
        catch (err) {
            next(err);
        }
    }
    async updateVariant(req, res, next) {
        try {
            const { id } = req.params;
            const variant = await variations_service_1.variationsService.updateVariant(id, req.body);
            return (0, response_1.sendSuccess)(res, variant, 200, "Variant updated");
        }
        catch (err) {
            next(err);
        }
    }
    async toggleVariantStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { active } = req.body;
            const variant = await variations_service_1.variationsService.toggleVariantStatus(id, active);
            return (0, response_1.sendSuccess)(res, variant, 200, "Variant status updated");
        }
        catch (err) {
            next(err);
        }
    }
    async deleteVariant(req, res, next) {
        try {
            const { id } = req.params;
            const result = await variations_service_1.variationsService.deleteVariant(id);
            return (0, response_1.sendSuccess)(res, result, 200, "Variant deleted");
        }
        catch (err) {
            next(err);
        }
    }
    async generateVariants(req, res, next) {
        try {
            const { itemId } = req.params;
            const result = await variations_service_1.variationsService.generateVariants(itemId);
            return (0, response_1.sendSuccess)(res, result, 200, result.message);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.VariationsController = VariationsController;
exports.variationsController = new VariationsController();
