"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsController = exports.SettingsController = void 0;
const settings_service_1 = require("./settings.service");
const response_1 = require("../../utils/response");
class SettingsController {
    async getSettings(_req, res, next) {
        try {
            const settings = await settings_service_1.settingsService.getSettings();
            return (0, response_1.sendSuccess)(res, settings);
        }
        catch (err) {
            next(err);
        }
    }
    async updateBusiness(req, res, next) {
        try {
            const updated = await settings_service_1.settingsService.updateBusinessSettings(req.body);
            return (0, response_1.sendSuccess)(res, updated, 200, "Business settings updated");
        }
        catch (err) {
            next(err);
        }
    }
    async updateInvoice(req, res, next) {
        try {
            const updated = await settings_service_1.settingsService.updateInvoiceSettings(req.body);
            return (0, response_1.sendSuccess)(res, updated, 200, "Invoice settings updated");
        }
        catch (err) {
            next(err);
        }
    }
}
exports.SettingsController = SettingsController;
exports.settingsController = new SettingsController();
