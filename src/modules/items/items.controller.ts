import { Request, Response, NextFunction } from "express";
import { itemsService } from "./items.service";
import { sendSuccess } from "../../utils/response";

export class ItemsController {
  async listItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId, search, includeInactive, variationMode } = req.query;
      const items = await itemsService.listItems({
        categoryId: categoryId as string,
        search: search as string,
        activeOnly: includeInactive !== "true",
        variationMode: variationMode as string,
      });
      return sendSuccess(res, items);
    } catch (err) {
      next(err);
    }
  }

  async getItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await itemsService.getItem(id);
      return sendSuccess(res, item);
    } catch (err) {
      next(err);
    }
  }

  async getItemStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await itemsService.getItemStats(id);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async createItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await itemsService.createItem(req.body, req.file);
      return sendSuccess(res, item, 201, "Item created successfully");
    } catch (err) {
      next(err);
    }
  }

  async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await itemsService.updateItem(id, req.body, req.file);
      return sendSuccess(res, item, 200, "Item updated successfully");
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { active } = req.body;
      const item = await itemsService.toggleStatus(id, active);
      return sendSuccess(res, item, 200, "Item status updated");
    } catch (err) {
      next(err);
    }
  }

  async deleteItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await itemsService.deleteItem(id);
      return sendSuccess(res, result, 200, "Item deleted successfully");
    } catch (err) {
      next(err);
    }
  }
}

export const itemsController = new ItemsController();