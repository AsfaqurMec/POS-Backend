import { Request, Response, NextFunction } from "express";
import { businessService } from "./business.service";
import { sendSuccess } from "../../utils/response";

export class BusinessController {
  async getBusiness(_req: Request, res: Response, next: NextFunction) {
    try {
      const business = await businessService.getBusiness();
      return sendSuccess(res, business);
    } catch (err) {
      next(err);
    }
  }

  async updateBusiness(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await businessService.updateBusiness(req.body, req.file);
      return sendSuccess(res, updated, 200, "Business settings updated");
    } catch (err) {
      next(err);
    }
  }
}

export const businessController = new BusinessController();