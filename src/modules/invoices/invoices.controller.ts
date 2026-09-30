import { Request, Response, NextFunction } from "express";
import { invoicesService } from "./invoices.service";
import { sendSuccess } from "../../utils/response";

export class InvoicesController {
  async listInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const result = await invoicesService.listInvoices(limit, page);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async getInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await invoicesService.getInvoice(id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const invoicesController = new InvoicesController();