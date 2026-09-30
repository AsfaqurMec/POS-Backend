"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsService = exports.SettingsService = void 0;
const prisma_1 = require("../../config/prisma");
const business_service_1 = require("../business/business.service");
class SettingsService {
    async getSettings() {
        return business_service_1.businessService.getBusiness();
    }
    async updateBusinessSettings(data) {
        return business_service_1.businessService.updateBusiness(data);
    }
    async updateInvoiceSettings(data) {
        const current = await business_service_1.businessService.getBusiness();
        return prisma_1.prisma.business.update({
            where: { id: current.id },
            data: {
                invoicePrefix: data.invoicePrefix ?? current.invoicePrefix,
                receiptFooterEn: data.receiptFooterEn !== undefined ? data.receiptFooterEn : current.receiptFooterEn,
                receiptFooterAr: data.receiptFooterAr !== undefined ? data.receiptFooterAr : current.receiptFooterAr,
            },
        });
    }
}
exports.SettingsService = SettingsService;
exports.settingsService = new SettingsService();
