import { Request, Response, NextFunction } from "express";
import { salesService } from "./sales.service";
import { sendSuccess } from "../../utils/response";
import { AuthenticatedRequest } from "../../middleware/auth";

export class SalesController {
  async createSale(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await salesService.createSale(req.user!.userId, req.body);
      return sendSuccess(res, result, 201, "Sale completed successfully");
    } catch (err) {
      next(err);
    }
  }

  async listSales(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const filters = {
        search: req.query.search as string | undefined,
        orderType: req.query.orderType as string | undefined,
        paymentMethod: req.query.paymentMethod as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        sortBy: req.query.sortBy as string | undefined,
      };
      const result = await salesService.listSales(limit, page, filters);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getSale(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await salesService.getSale(id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async voidSale(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { voidReason, restock } = req.body;
      const result = await salesService.voidSale(
        req.user!.userId,
        id,
        voidReason,
        restock !== false
      );
      return sendSuccess(res, result, 200, "Sale voided and refunded successfully");
    } catch (err) {
      next(err);
    }
  }

  async holdOrder(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await salesService.holdOrder(req.user!.userId, req.body);
      return sendSuccess(res, result, 201, "Order held successfully");
    } catch (err) {
      next(err);
    }
  }

  async getHeldOrders(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await salesService.getHeldOrders();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async deleteHeldOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await salesService.deleteHeldOrder(id);
      return sendSuccess(res, result, 200, "Held order removed");
    } catch (err) {
      next(err);
    }
  }
}

export const salesController = new SalesController();