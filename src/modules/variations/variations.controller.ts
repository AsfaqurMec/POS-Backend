import { Request, Response, NextFunction } from "express";
import { variationsService } from "./variations.service";
import { sendSuccess } from "../../utils/response";

export class VariationsController {
  // Groups
  async listGroups(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const groups = await variationsService.listGroups(id);
      return sendSuccess(res, groups);
    } catch (err) {
      next(err);
    }
  }

  async createGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const group = await variationsService.createGroup(id, req.body);
      return sendSuccess(res, group, 201, "Variation group created");
    } catch (err) {
      next(err);
    }
  }

  async updateGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const group = await variationsService.updateGroup(id, req.body);
      return sendSuccess(res, group, 200, "Variation group updated");
    } catch (err) {
      next(err);
    }
  }

  async deleteGroup(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await variationsService.deleteGroup(id);
      return sendSuccess(res, result, 200, "Variation group deleted");
    } catch (err) {
      next(err);
    }
  }

  // Options
  async createOption(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const option = await variationsService.createOption(id, req.body);
      return sendSuccess(res, option, 201, "Option created");
    } catch (err) {
      next(err);
    }
  }

  async updateOption(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const option = await variationsService.updateOption(id, req.body);
      return sendSuccess(res, option, 200, "Option updated");
    } catch (err) {
      next(err);
    }
  }

  async deleteOption(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await variationsService.deleteOption(id);
      return sendSuccess(res, result, 200, "Option deleted");
    } catch (err) {
      next(err);
    }
  }

  // Variants
  async listVariants(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const variants = await variationsService.listVariants(id);
      return sendSuccess(res, variants);
    } catch (err) {
      next(err);
    }
  }

  async createVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const variant = await variationsService.createVariant(id, req.body);
      return sendSuccess(res, variant, 201, "Variant created");
    } catch (err) {
      next(err);
    }
  }

  async updateVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const variant = await variationsService.updateVariant(id, req.body);
      return sendSuccess(res, variant, 200, "Variant updated");
    } catch (err) {
      next(err);
    }
  }

  async toggleVariantStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { active } = req.body;
      const variant = await variationsService.toggleVariantStatus(id, active);
      return sendSuccess(res, variant, 200, "Variant status updated");
    } catch (err) {
      next(err);
    }
  }

  async deleteVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await variationsService.deleteVariant(id);
      return sendSuccess(res, result, 200, "Variant deleted");
    } catch (err) {
      next(err);
    }
  }

  async generateVariants(req: Request, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const result = await variationsService.generateVariants(itemId);
      return sendSuccess(res, result, 200, result.message);
    } catch (err) {
      next(err);
    }
  }
}

export const variationsController = new VariationsController();