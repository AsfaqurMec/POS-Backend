"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessService = exports.BusinessService = void 0;
const prisma_1 = require("../../config/prisma");
const upload_1 = require("../../middleware/upload");
class BusinessService {
    async getBusiness() {
        let business = await prisma_1.prisma.business.findFirst();
        if (!business) {
            business = await prisma_1.prisma.business.create({
                data: {
                    nameEn: "Aroma Coffee",
                    nameAr: "مقهى أروما",
                    currency: "SAR",
                    timezone: "Asia/Riyadh",
                },
            });
        }
        return business;
    }
    async updateBusiness(data, newLogoFile) {
        const current = await this.getBusiness();
        let logoUrl = current.logoUrl;
        if (newLogoFile) {
            const newRelativePath = `/uploads/businesses/${newLogoFile.filename}`;
            if (current.logoUrl) {
                (0, upload_1.deleteUploadedFile)(current.logoUrl);
            }
            logoUrl = newRelativePath;
        }
        const updated = await prisma_1.prisma.business.update({
            where: { id: current.id },
            data: {
                nameEn: data.nameEn ?? current.nameEn,
                nameAr: data.nameAr ?? current.nameAr,
                phone: data.phone !== undefined ? data.phone : current.phone,
                addressEn: data.addressEn !== undefined ? data.addressEn : current.addressEn,
                addressAr: data.addressAr !== undefined ? data.addressAr : current.addressAr,
                currency: data.currency ?? current.currency,
                timezone: data.timezone ?? current.timezone,
                taxEnabled: data.taxEnabled !== undefined ? Boolean(data.taxEnabled === true || data.taxEnabled === "true") : current.taxEnabled,
                taxRate: data.taxRate !== undefined ? parseFloat(data.taxRate) : current.taxRate,
                pricingMode: data.pricingMode ?? current.pricingMode,
                invoicePrefix: data.invoicePrefix ?? current.invoicePrefix,
                receiptFooterEn: data.receiptFooterEn !== undefined ? data.receiptFooterEn : current.receiptFooterEn,
                receiptFooterAr: data.receiptFooterAr !== undefined ? data.receiptFooterAr : current.receiptFooterAr,
                logoUrl,
            },
        });
        return updated;
    }
}
exports.BusinessService = BusinessService;
exports.businessService = new BusinessService();
