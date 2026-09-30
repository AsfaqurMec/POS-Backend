import { prisma } from "../../config/prisma";
import { businessService } from "../business/business.service";

export class SettingsService {
  async getSettings() {
    return businessService.getBusiness();
  }

  async updateBusinessSettings(data: any) {
    return businessService.updateBusiness(data);
  }

  async updateInvoiceSettings(data: { invoicePrefix?: string; receiptFooterEn?: string; receiptFooterAr?: string }) {
    const current = await businessService.getBusiness();
    return prisma.business.update({
      where: { id: current.id },
      data: {
        invoicePrefix: data.invoicePrefix ?? current.invoicePrefix,
        receiptFooterEn: data.receiptFooterEn !== undefined ? data.receiptFooterEn : current.receiptFooterEn,
        receiptFooterAr: data.receiptFooterAr !== undefined ? data.receiptFooterAr : current.receiptFooterAr,
      },
    });
  }
}

export const settingsService = new SettingsService();