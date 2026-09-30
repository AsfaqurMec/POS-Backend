import { Request, Response, NextFunction } from "express";
import { categoriesService } from "./categories.service";
import { sendSuccess } from "../../utils/response";

export class CategoriesController {
  async listCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const includeInactive = req.query.includeInactive === "true";
      const categories = await categoriesService.listCategories(includeInactive);
      return sendSuccess(res, categories);
    } catch (err) {
      next(err);
    }
  }

  async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoriesService.getCategory(id);
      return sendSuccess(res, category);
    } catch (err) {
      next(err);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoriesService.createCategory(req.body, req.file);
      return sendSuccess(res, category, 201, "Category created successfully");
    } catch (err) {
      next(err);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const category = await categoriesService.updateCategory(id, req.body, req.file);
      return sendSuccess(res, category, 200, "Category updated successfully");
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { active } = req.body;
      const category = await categoriesService.toggleStatus(id, active);
      return sendSuccess(res, category, 200, "Category status updated");
    } catch (err) {
      next(err);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await categoriesService.deleteCategory(id);
      return sendSuccess(res, result, 200, "Category deleted successfully");
    } catch (err) {
      next(err);
    }
  }
}

export const categoriesController = new CategoriesController();