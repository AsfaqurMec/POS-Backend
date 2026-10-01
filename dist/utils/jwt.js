"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyToken = verifyToken;
exports.signManagerToken = signManagerToken;
exports.verifyManagerToken = verifyManagerToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
function signToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_SECRET, {
        expiresIn: env_1.ENV.JWT_EXPIRES_IN,
    });
}
function verifyToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
}
function signManagerToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.ENV.JWT_SECRET, {
        expiresIn: "90s",
    });
}
function verifyManagerToken(token) {
    return jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
}
