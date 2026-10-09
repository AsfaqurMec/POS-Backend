"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const compression_1 = __importDefault(require("compression"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
app.disable("x-powered-by");
// Compression middleware: compress all responses (gzip/deflate)
app.use((0, compression_1.default)({
    filter: (req, res) => {
        if (req.headers["x-no-compression"]) {
            return false;
        }
        return compression_1.default.filter(req, res);
    },
    level: 6,
}));
// Middleware
const allowedOrigins = env_1.ENV.CORS_ORIGIN === "*"
    ? "*"
    : env_1.ENV.CORS_ORIGIN.includes(",")
        ? env_1.ENV.CORS_ORIGIN.split(",").map((o) => o.trim())
        : env_1.ENV.CORS_ORIGIN;
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Serve static uploads with aggressive caching (7 days, etag, immutable)
app.use("/uploads", express_1.default.static(path_1.default.resolve(process.cwd(), env_1.ENV.UPLOAD_DIR), {
    maxAge: "7d",
    etag: true,
    immutable: true,
}));
// Mount API routes
app.use("/api", routes_1.default);
// Health check
app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Coffee Shop POS Backend", timestamp: new Date().toISOString() });
});
// Global Error Handler
app.use(errorHandler_1.errorHandler);
// Start Server if not imported as module
if (env_1.ENV.NODE_ENV !== "test") {
    app.listen(env_1.ENV.PORT, () => {
        console.log(`☕ Coffee Shop POS Backend running at http://localhost:${env_1.ENV.PORT}`);
        console.log(`📁 Uploads available at http://localhost:${env_1.ENV.PORT}/uploads`);
    });
}
exports.default = app;
