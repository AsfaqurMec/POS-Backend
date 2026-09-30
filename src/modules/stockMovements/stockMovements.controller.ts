import { Request, Response, NextFunction } from "express";
import { stockMovementsService } from "./stockMovements.service";
import { sendSuccess } from "../../utils/response";
import { AuthenticatedRequest } from "../../middleware/auth";

export class StockMovementsController {
  async listMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const filters = {
        itemId: req.query.itemId as string | undefined,
        variantId: req.query.variantId as string | undefined,
        type: req.query.type as string | undefined,
        search: req.query.search as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        page,
        limit,
      };

      const result = await stockMovementsService.listMovements(filters);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async createManualMovement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const result = await stockMovementsService.createManualMovement(userId, req.body);
      return sendSuccess(res, result, 201, "Stock movement logged successfully");
    } catch (err) {
      next(err);
    }
  }
}

export const stockMovementsController = new StockMovementsController();
