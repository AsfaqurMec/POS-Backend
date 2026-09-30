"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const response_1 = require("../utils/response");
const zod_1 = require("zod");
function errorHandler(err, req, res, next) {
    console.error("API Error:", err);
    if (err instanceof response_1.AppError) {
        return (0, response_1.sendError)(res, err.code, err.message, err.statusCode);
    }
    if (err instanceof zod_1.ZodError) {
        const message = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        return (0, response_1.sendError)(res, "VALIDATION_ERROR", message, 400);
    }
    if (err.name === "MulterError") {
        if (err.code === "LIMIT_FILE_SIZE") {
            return (0, response_1.sendError)(res, "INVALID_IMAGE", "File size exceeds the 5MB limit", 400);
        }
        return (0, response_1.sendError)(res, "UPLOAD_FAILED", err.message, 400);
    }
    return (0, response_1.sendError)(res, "INTERNAL_SERVER_ERROR", "An unexpected error occurred", 500);
}
