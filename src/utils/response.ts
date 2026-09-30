import { Response } from "express";

export class AppError extends Error {
  public statusCode: number;
  public code: string;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200, message?: string) {
  return res.status(statusCode).json({
    success: true,
    ...(message ? { message } : {}),
    data,
  });
}

export function sendError(res: Response, code: string, message: string, statusCode = 400) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
  });
}