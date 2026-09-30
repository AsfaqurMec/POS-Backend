import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/response";
import { deleteUploadedFile } from "../../middleware/upload";

export class BusinessService {
  async getBusiness() {
    let business = await prisma.business.findFirst();
    if (!business) {
      business = await prisma.business.create({
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

  async updateBusiness(data: any, newLogoFile?: Express.Multer.File) {
    const current = await this.getBusiness();

    let logoUrl = current.logoUrl;
    if (newLogoFile) {
      const newRelativePath = `/uploads/businesses/${newLogoFile.filename}`;
      if (current.logoUrl) {
        deleteUploadedFile(current.logoUrl);
      }
      logoUrl = newRelativePath;
    }

    const updated = await prisma.business.update({
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

export const businessService = new BusinessService();