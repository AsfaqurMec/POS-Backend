import { Request, Response, NextFunction } from "express";
import { usersService } from "./users.service";
import { sendSuccess } from "../../utils/response";

export class UsersController {
  async listUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await usersService.listUsers();
      return sendSuccess(res, users);
    } catch (err) {
      next(err);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await usersService.getUser(id);
      return sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body;
      const user = await usersService.createUser({
        name,
        email,
        passwordPlain: password,
        role,
      });
      return sendSuccess(res, user, 201, "User created successfully");
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await usersService.updateUser(id, req.body);
      return sendSuccess(res, user, 200, "User updated successfully");
    } catch (err) {
      next(err);
    }
  }

  async toggleStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = await usersService.toggleStatus(id, status);
      return sendSuccess(res, user, 200, "User status updated");
    } catch (err) {
      next(err);
    }
  }

  async updateUserPin(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { pinCode } = req.body;
      const user = await usersService.updateUserPin(id, pinCode);
      return sendSuccess(res, user, 200, "User PIN updated successfully");
    } catch (err) {
      next(err);
    }
  }
}

export const usersController = new UsersController();