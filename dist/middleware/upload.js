"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUploader = createUploader;
exports.deleteUploadedFile = deleteUploadedFile;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
function createUploader(destinationFolder) {
    const targetDir = path_1.default.resolve(process.cwd(), env_1.ENV.UPLOAD_DIR, destinationFolder);
    if (!fs_1.default.existsSync(targetDir)) {
        fs_1.default.mkdirSync(targetDir, { recursive: true });
    }
    const storage = multer_1.default.diskStorage({
        destination: (_req, _file, cb) => {
            cb(null, targetDir);
        },
        filename: (_req, file, cb) => {
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            const uniqueName = `${crypto_1.default.randomUUID()}${ext}`;
            cb(null, uniqueName);
        },
    });
    return (0, multer_1.default)({
        storage,
        limits: {
            fileSize: MAX_FILE_SIZE,
        },
        fileFilter: (_req, file, cb) => {
            const ext = path_1.default.extname(file.originalname).toLowerCase();
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
                return cb(new response_1.AppError("INVALID_IMAGE", "Only JPEG, PNG, and WEBP image formats are supported"));
            }
            cb(null, true);
        },
    });
}
function deleteUploadedFile(relativeOrAbsoluteUrl) {
    if (!relativeOrAbsoluteUrl)
        return;
    try {
        const cleanPath = relativeOrAbsoluteUrl.replace(/^https?:\/\/[^\/]+/, "").replace(/^\//, "");
        const fullPath = path_1.default.resolve(process.cwd(), cleanPath);
        const uploadsRoot = path_1.default.resolve(process.cwd(), env_1.ENV.UPLOAD_DIR);
        if (fullPath.startsWith(uploadsRoot) && fs_1.default.existsSync(fullPath)) {
            fs_1.default.unlinkSync(fullPath);
        }
    }
    catch (err) {
        console.warn("Failed to delete old image:", err);
    }
}
