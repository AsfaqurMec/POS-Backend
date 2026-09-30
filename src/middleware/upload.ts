import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { AppError } from "../utils/response";
import { ENV } from "../config/env";

export type UploadDestination = "businesses" | "categories" | "products";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export function createUploader(destinationFolder: UploadDestination) {
  const targetDir = path.resolve(process.cwd(), ENV.UPLOAD_DIR, destinationFolder);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, targetDir);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${crypto.randomUUID()}${ext}`;
      cb(null, uniqueName);
    },
  });

  return multer({
    storage,
    limits: {
      fileSize: MAX_FILE_SIZE,
    },
    fileFilter: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype) || !ALLOWED_EXTENSIONS.includes(ext)) {
        return cb(new AppError("INVALID_IMAGE", "Only JPEG, PNG, and WEBP image formats are supported"));
      }
      cb(null, true);
    },
  });
}

export function deleteUploadedFile(relativeOrAbsoluteUrl?: string | null) {
  if (!relativeOrAbsoluteUrl) return;

  try {
    const cleanPath = relativeOrAbsoluteUrl.replace(/^https?:\/\/[^\/]+/, "").replace(/^\//, "");
    const fullPath = path.resolve(process.cwd(), cleanPath);

    const uploadsRoot = path.resolve(process.cwd(), ENV.UPLOAD_DIR);
    if (fullPath.startsWith(uploadsRoot) && fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.warn("Failed to delete old image:", err);
  }
}