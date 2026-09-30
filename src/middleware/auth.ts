import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import { sendError } from "../utils/response";
import { prisma } from "../config/prisma";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { status: string };
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendError(res, "UNAUTHORIZED", "Authentication token is required", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return sendError(res, "UNAUTHORIZED", "Account is inactive or does not exist", 401);
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    // Guest Mode check: guest can ONLY view (GET, HEAD, OPTIONS). No POST, PUT, PATCH, DELETE!
    if (user.role === "GUEST") {
      const allowedMethods = ["GET", "HEAD", "OPTIONS"];
      const isLogout = (req.baseUrl.endsWith("/auth") && req.path === "/logout") || (req.originalUrl && req.originalUrl.includes("/auth/logout"));
      if (!allowedMethods.includes(req.method) && !isLogout) {
        return sendError(
          res,
          "FORBIDDEN",
          "Guest mode is view-only. You cannot create, edit, or modify any data.",
          403
        );
      }
    }

    next();
  } catch (error) {
    return sendError(res, "UNAUTHORIZED", "Invalid or expired token", 401);
  }
}

export async function optionalAuthenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, role: true, status: true },
      });
      if (user && user.status === "ACTIVE") {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
        };
      }
    }
  } catch {
    // Ignore invalid token in optional mode
  }
  next();
}

export function authorize(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, "UNAUTHORIZED", "Authentication required", 401);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(res, "FORBIDDEN", "You do not have permission to perform this action", 403);
    }

    next();
  };
}