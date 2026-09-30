import { Request, Response, NextFunction } from "express";
import { dashboardService, DashboardFilter } from "./dashboard.service";
import { sendSuccess } from "../../utils/response";

export class DashboardController {
  async getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
      const filter: DashboardFilter = {
        period: req.query.period as any,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      const stats = await dashboardService.getDashboardStats(filter);
      return sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  }
}

export const dashboardController = new DashboardController();
