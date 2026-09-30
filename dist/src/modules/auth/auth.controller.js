"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const auth_validation_1 = require("./auth.validation");
const response_1 = require("../../utils/response");
class AuthController {
    async login(req, res, next) {
        try {
            const data = auth_validation_1.loginSchema.parse(req.body);
            const result = await auth_service_1.authService.login(data.email, data.password);
            return (0, response_1.sendSuccess)(res, result, 200, "Login successful");
        }
        catch (err) {
            next(err);
        }
    }
    async logout(_req, res) {
        return (0, response_1.sendSuccess)(res, { loggedOut: true }, 200, "Logged out successfully");
    }
    async guestLogin(_req, res, next) {
        try {
            const result = await auth_service_1.authService.guestLogin();
            return (0, response_1.sendSuccess)(res, result, 200, "Guest login successful");
        }
        catch (err) {
            next(err);
        }
    }
    async getMe(req, res, next) {
        try {
            const result = await auth_service_1.authService.getMe(req.user.userId);
            return (0, response_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
    async changePassword(req, res, next) {
        try {
            const data = auth_validation_1.changePasswordSchema.parse(req.body);
            await auth_service_1.authService.changePassword(req.user.userId, data.currentPassword, data.newPassword);
            return (0, response_1.sendSuccess)(res, { changed: true }, 200, "Password updated successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async pinLogin(req, res, next) {
        try {
            const { pinCode } = req.body;
            const result = await auth_service_1.authService.pinLogin(pinCode);
            return (0, response_1.sendSuccess)(res, result, 200, "PIN login successful");
        }
        catch (err) {
            next(err);
        }
    }
    async verifyManagerPin(req, res, next) {
        try {
            const { pinCode } = req.body;
            const result = await auth_service_1.authService.verifyManagerPin(pinCode);
            return (0, response_1.sendSuccess)(res, result, 200, "Manager PIN verified");
        }
        catch (err) {
            next(err);
        }
    }
    async updatePin(req, res, next) {
        try {
            const { pinCode } = req.body;
            await auth_service_1.authService.updatePin(req.user.userId, pinCode);
            return (0, response_1.sendSuccess)(res, { updated: true }, 200, "PIN updated successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async unlockTerminal(req, res, next) {
        try {
            const { pinCode } = req.body;
            const currentUserId = req.user?.userId;
            const result = await auth_service_1.authService.unlockTerminal(pinCode, currentUserId);
            return (0, response_1.sendSuccess)(res, result, 200, "Terminal unlocked successfully");
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
