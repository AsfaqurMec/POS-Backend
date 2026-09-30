import { Request, Response, NextFunction } from "express";
import { AppError, sendError } from "../utils/response";
import { ZodError } from "zod";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error("API Error:", err);

  if (err instanceof AppError) {
    return sendError(res, err.code, err.message, err.statusCode);
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return sendError(res, "VALIDATION_ERROR", message, 400);
  }

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return sendError(res, "INVALID_IMAGE", "File size exceeds the 5MB limit", 400);
    }
    return sendError(res, "UPLOAD_FAILED", err.message, 400);
  }

  return sendError(res, "INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
}