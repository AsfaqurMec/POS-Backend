"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = exports.UsersController = void 0;
const users_service_1 = require("./users.service");
const response_1 = require("../../utils/response");
class UsersController {
    async listUsers(_req, res, next) {
        try {
            const users = await users_service_1.usersService.listUsers();
            return (0, response_1.sendSuccess)(res, users);
        }
        catch (err) {
            next(err);
        }
    }
    async getUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await users_service_1.usersService.getUser(id);
            return (0, response_1.sendSuccess)(res, user);
        }
        catch (err) {
            next(err);
        }
    }
    async createUser(req, res, next) {
        try {
            const { name, email, password, role } = req.body;
            const user = await users_service_1.usersService.createUser({
                name,
                email,
                passwordPlain: password,
                role,
            });
            return (0, response_1.sendSuccess)(res, user, 201, "User created successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const user = await users_service_1.usersService.updateUser(id, req.body);
            return (0, response_1.sendSuccess)(res, user, 200, "User updated successfully");
        }
        catch (err) {
            next(err);
        }
    }
    async toggleStatus(req, res, next) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const user = await users_service_1.usersService.toggleStatus(id, status);
            return (0, response_1.sendSuccess)(res, user, 200, "User status updated");
        }
        catch (err) {
            next(err);
        }
    }
    async updateUserPin(req, res, next) {
        try {
            const { id } = req.params;
            const { pinCode } = req.body;
            const user = await users_service_1.usersService.updateUserPin(id, pinCode);
            return (0, response_1.sendSuccess)(res, user, 200, "User PIN updated successfully");
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UsersController = UsersController;
exports.usersController = new UsersController();
