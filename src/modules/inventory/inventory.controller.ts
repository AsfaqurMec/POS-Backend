import { Request, Response, NextFunction } from "express";
import { inventoryService } from "./inventory.service";
import { sendSuccess } from "../../utils/response";

export class InventoryController {
  async getInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search as string;
      const list = await inventoryService.getInventory(search);
      return sendSuccess(res, list);
    } catch (err) {
      next(err);
    }
  }

  async updateStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { type, quantity, delta, movementType, reason } = req.body;
      const userId = (req as any).user?.userId;
      const parsedQty = quantity !== undefined ? parseInt(quantity, 10) : undefined;
      const parsedDelta = delta !== undefined ? parseInt(delta, 10) : undefined;
      const result = await inventoryService.updateStock(
        id,
        type,
        parsedQty,
        parsedDelta,
        movementType,
        reason,
        userId
      );
      return sendSuccess(res, result, 200, "Inventory stock updated");
    } catch (err) {
      next(err);
    }
  }
}

export const inventoryController = new InventoryController();