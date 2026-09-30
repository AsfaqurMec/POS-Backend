import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { loginSchema, changePasswordSchema } from "./auth.validation";
import { sendSuccess } from "../../utils/response";
import { AuthenticatedRequest } from "../../middleware/auth";

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = loginSchema.parse(req.body);
      const result = await authService.login(data.email, data.password);
      return sendSuccess(res, result, 200, "Login successful");
    } catch (err) {
      next(err);
    }
  }

  async logout(_req: Request, res: Response) {
    return sendSuccess(res, { loggedOut: true }, 200, "Logged out successfully");
  }

  async guestLogin(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.guestLogin();
      return sendSuccess(res, result, 200, "Guest login successful");
    } catch (err) {
      next(err);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.getMe(req.user!.userId);
      return sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = changePasswordSchema.parse(req.body);
      await authService.changePassword(req.user!.userId, data.currentPassword, data.newPassword);
      return sendSuccess(res, { changed: true }, 200, "Password updated successfully");
    } catch (err) {
      next(err);
    }
  }

  async pinLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { pinCode } = req.body;
      const result = await authService.pinLogin(pinCode);
      return sendSuccess(res, result, 200, "PIN login successful");
    } catch (err) {
      next(err);
    }
  }

  async verifyManagerPin(req: Request, res: Response, next: NextFunction) {
    try {
      const { pinCode } = req.body;
      const result = await authService.verifyManagerPin(pinCode);
      return sendSuccess(res, result, 200, "Manager PIN verified");
    } catch (err) {
      next(err);
    }
  }

  async updatePin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { pinCode } = req.body;
      await authService.updatePin(req.user!.userId, pinCode);
      return sendSuccess(res, { updated: true }, 200, "PIN updated successfully");
    } catch (err) {
      next(err);
    }
  }

  async unlockTerminal(req: Request, res: Response, next: NextFunction) {
    try {
      const { pinCode } = req.body;
      const currentUserId = (req as any).user?.userId;
      const result = await authService.unlockTerminal(pinCode, currentUserId);
      return sendSuccess(res, result, 200, "Terminal unlocked successfully");
    } catch (err) {
      next(err);
    }
  }
}

export const authController = new AuthController();