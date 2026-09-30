import { Request, Response, NextFunction } from "express";
import { settingsService } from "./settings.service";
import { sendSuccess } from "../../utils/response";

export class SettingsController {
  async getSettings(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.getSettings();
      return sendSuccess(res, settings);
    } catch (err) {
      next(err);
    }
  }

  async updateBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await settingsService.updateBusinessSettings(req.body);
      return sendSuccess(res, updated, 200, "Business settings updated");
    } catch (err) {
      next(err);
    }
  }

  async updateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await settingsService.updateInvoiceSettings(req.body);
      return sendSuccess(res, updated, 200, "Invoice settings updated");
    } catch (err) {
      next(err);
    }
  }
}

export const settingsController = new SettingsController();