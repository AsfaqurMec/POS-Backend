import { Response, NextFunction } from "express";
import { shiftsService } from "./shifts.service";
import { sendSuccess } from "../../utils/response";
import { AuthenticatedRequest } from "../../middleware/auth";

export class ShiftsController {
  async openShift(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { startFloat } = req.body;
      const result = await shiftsService.openShift(req.user!.userId, Number(startFloat) || 0);
      return sendSuccess(res, result, 201, "Shift opened successfully");
    } catch (err) {
      next(err);
    }
  }

  async getCurrentShift(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await shiftsService.getCurrentShift(req.user!.userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async addCashMovement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { shiftId, type, amount, reason } = req.body;
      const result = await shiftsService.addCashMovement(
        req.user!.userId,
        shiftId,
        type,
        Number(amount),
        reason
      );
      return sendSuccess(res, result, 201, "Cash movement recorded");
    } catch (err) {
      next(err);
    }
  }

  async closeShift(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { shiftId, actualCash, notes } = req.body;
      const result = await shiftsService.closeShift(
        req.user!.userId,
        shiftId,
        Number(actualCash) || 0,
        notes
      );
      return sendSuccess(res, result, 200, "Shift closed and Z-Report generated");
    } catch (err) {
      next(err);
    }
  }

  async getShiftReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await shiftsService.getShiftReport(id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const shiftsController = new ShiftsController();
