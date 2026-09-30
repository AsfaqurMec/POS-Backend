"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
class AppError extends Error {
    statusCode;
    code;
    constructor(code, message, statusCode = 400) {
        super(message);
        this.name = "AppError";
        this.code = code;
        this.statusCode = statusCode;
    }
}
exports.AppError = AppError;
function sendSuccess(res, data, statusCode = 200, message) {
    return res.status(statusCode).json({
        success: true,
        ...(message ? { message } : {}),
        data,
    });
}
function sendError(res, code, message, statusCode = 400) {
    return res.status(statusCode).json({
        success: false,
        error: {
            code,
            message,
        },
    });
}
