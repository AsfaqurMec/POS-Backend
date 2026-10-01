"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ENV = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.ENV = {
    PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
    NODE_ENV: process.env.NODE_ENV || "development",
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    JWT_SECRET: process.env.JWT_SECRET || "coffee_pos_super_secret_jwt_key_2026",
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
    UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
};
