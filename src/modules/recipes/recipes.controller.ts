import { Request, Response, NextFunction } from "express";
import { recipesService } from "./recipes.service";
import { sendSuccess } from "../../utils/response";
import { AuthenticatedRequest } from "../../middleware/auth";

export class RecipesController {
  async listIngredients(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recipesService.listIngredients();
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async createIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await recipesService.createIngredient(req.body);
      return sendSuccess(res, result, 201, "Ingredient added successfully");
    } catch (err) {
      next(err);
    }
  }

  async updateIngredient(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await recipesService.updateIngredient(id, req.body);
      return sendSuccess(res, result, 200, "Ingredient updated successfully");
    } catch (err) {
      next(err);
    }
  }

  async getRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const result = await recipesService.getRecipe(itemId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async setRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const { ingredients } = req.body;
      const result = await recipesService.setRecipe(itemId, ingredients || []);
      return sendSuccess(res, result, 200, "Recipe saved successfully");
    } catch (err) {
      next(err);
    }
  }

  async logWastage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await recipesService.logWastage(req.user!.userId, req.body);
      return sendSuccess(res, result, 201, "Wastage logged successfully");
    } catch (err) {
      next(err);
    }
  }

  async listWasteLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const result = await recipesService.listWasteLogs(limit, page);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const recipesController = new RecipesController();
