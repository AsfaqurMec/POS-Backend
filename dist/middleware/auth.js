"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuthenticate = optionalAuthenticate;
exports.authorize = authorize;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const prisma_1 = require("../config/prisma");
async function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return (0, response_1.sendError)(res, "UNAUTHORIZED", "Authentication token is required", 401);
        }
        const token = authHeader.split(" ")[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, role: true, status: true },
        });
        if (!user || user.status !== "ACTIVE") {
            return (0, response_1.sendError)(res, "UNAUTHORIZED", "Account is inactive or does not exist", 401);
        }
        req.user = {
            userId: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
        };
        // Guest Mode check: guest can ONLY view (GET, HEAD, OPTIONS). No POST, PUT, PATCH, DELETE!
        if (user.role === "GUEST") {
            const allowedMethods = ["GET", "HEAD", "OPTIONS"];
            const isLogout = (req.baseUrl.endsWith("/auth") && req.path === "/logout") || (req.originalUrl && req.originalUrl.includes("/auth/logout"));
            if (!allowedMethods.includes(req.method) && !isLogout) {
                return (0, response_1.sendError)(res, "FORBIDDEN", "Guest mode is view-only. You cannot create, edit, or modify any data.", 403);
            }
        }
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, "UNAUTHORIZED", "Invalid or expired token", 401);
    }
}
async function optionalAuthenticate(req, _res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            const decoded = (0, jwt_1.verifyToken)(token);
            const user = await prisma_1.prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, role: true, status: true },
            });
            if (user && user.status === "ACTIVE") {
                req.user = {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                };
            }
        }
    }
    catch {
        // Ignore invalid token in optional mode
    }
    next();
}
function authorize(roles) {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_1.sendError)(res, "UNAUTHORIZED", "Authentication required", 401);
        }
        if (!roles.includes(req.user.role)) {
            return (0, response_1.sendError)(res, "FORBIDDEN", "You do not have permission to perform this action", 403);
        }
        next();
    };
}
