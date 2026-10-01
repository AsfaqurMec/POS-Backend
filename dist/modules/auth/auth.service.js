"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../config/prisma");
const jwt_1 = require("../../utils/jwt");
const response_1 = require("../../utils/response");
class AuthService {
    async login(email, passwordPlain) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() },
        });
        if (!user) {
            throw new response_1.AppError("INVALID_LOGIN", "Invalid email or password", 401);
        }
        if (user.status !== "ACTIVE") {
            throw new response_1.AppError("UNAUTHORIZED", "User account is deactivated. Please contact an admin.", 403);
        }
        const isValid = await bcryptjs_1.default.compare(passwordPlain, user.passwordHash);
        if (!isValid) {
            throw new response_1.AppError("INVALID_LOGIN", "Invalid email or password", 401);
        }
        const token = (0, jwt_1.signToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        };
    }
    async getMe(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new response_1.AppError("USER_NOT_FOUND", "User not found", 404);
        }
        return user;
    }
    async changePassword(userId, currentPlain, newPlain) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new response_1.AppError("USER_NOT_FOUND", "User not found", 404);
        }
        const isMatch = await bcryptjs_1.default.compare(currentPlain, user.passwordHash);
        if (!isMatch) {
            throw new response_1.AppError("INVALID_PASSWORD", "Current password does not match", 400);
        }
        const newHash = await bcryptjs_1.default.hash(newPlain, 10);
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newHash },
        });
        return { success: true };
    }
    async pinLogin(pinCode) {
        if (!pinCode || pinCode.trim().length === 0) {
            throw new response_1.AppError("INVALID_PIN", "PIN code is required", 400);
        }
        const cleanPin = pinCode.trim();
        const user = await prisma_1.prisma.user.findFirst({
            where: {
                pinCode: cleanPin,
                status: "ACTIVE",
            },
        });
        if (!user) {
            throw new response_1.AppError("INVALID_PIN", "Invalid PIN code entered", 401);
        }
        const token = (0, jwt_1.signToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        };
    }
    async verifyManagerPin(pinCode) {
        if (!pinCode || pinCode.trim().length === 0) {
            throw new response_1.AppError("INVALID_PIN", "Manager PIN is required", 400);
        }
        const cleanPin = pinCode.trim();
        const manager = await prisma_1.prisma.user.findFirst({
            where: {
                pinCode: cleanPin,
                role: "ADMIN",
                status: "ACTIVE",
            },
        });
        if (!manager) {
            throw new response_1.AppError("UNAUTHORIZED_MANAGER_PIN", "Invalid Manager PIN or insufficient privileges", 403);
        }
        return {
            valid: true,
            manager: {
                id: manager.id,
                name: manager.name,
                email: manager.email,
            },
        };
    }
    async updatePin(userId, pinCode) {
        if (!pinCode || pinCode.trim().length < 4) {
            throw new response_1.AppError("INVALID_PIN", "PIN must be at least 4 digits", 400);
        }
        await prisma_1.prisma.user.update({
            where: { id: userId },
            data: { pinCode: pinCode.trim() },
        });
        return { success: true };
    }
    async unlockTerminal(pinCode, currentUserId) {
        if (!pinCode || pinCode.trim().length === 0) {
            throw new response_1.AppError("INVALID_PIN", "PIN code is required", 400);
        }
        const cleanPin = pinCode.trim();
        // 1. If currentUserId is provided, check if it matches the current user's PIN
        if (currentUserId) {
            const currentUser = await prisma_1.prisma.user.findUnique({
                where: { id: currentUserId },
            });
            if (currentUser && currentUser.status === "ACTIVE" && currentUser.pinCode === cleanPin) {
                return { unlocked: true, unlockedBy: "SELF", userName: currentUser.name };
            }
        }
        // 2. Alternatively check if an ADMIN / Manager is unlocking the terminal
        const adminUser = await prisma_1.prisma.user.findFirst({
            where: {
                pinCode: cleanPin,
                role: "ADMIN",
                status: "ACTIVE",
            },
        });
        if (adminUser) {
            return { unlocked: true, unlockedBy: "MANAGER", userName: adminUser.name };
        }
        // 3. Fallback: check if ANY active staff user has this PIN
        const anyUser = await prisma_1.prisma.user.findFirst({
            where: {
                pinCode: cleanPin,
                status: "ACTIVE",
            },
        });
        if (anyUser) {
            return { unlocked: true, unlockedBy: "STAFF", userName: anyUser.name };
        }
        throw new response_1.AppError("INVALID_PIN", "Incorrect PIN. Enter your staff PIN or Manager PIN to unlock.", 401);
    }
    async guestLogin() {
        let guestUser = await prisma_1.prisma.user.findFirst({
            where: { role: "GUEST" },
        });
        if (!guestUser) {
            guestUser = await prisma_1.prisma.user.create({
                data: {
                    name: "Guest Visitor",
                    email: "guest@pos.local",
                    passwordHash: "GUEST_READONLY",
                    role: "GUEST",
                    status: "ACTIVE",
                    pinCode: "0000",
                },
            });
        }
        const token = (0, jwt_1.signToken)({
            userId: guestUser.id,
            email: guestUser.email,
            role: guestUser.role,
        });
        return {
            token,
            user: {
                id: guestUser.id,
                name: guestUser.name,
                email: guestUser.email,
                role: guestUser.role,
                status: guestUser.status,
            },
        };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
