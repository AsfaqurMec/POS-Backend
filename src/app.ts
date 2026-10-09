import express from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import { ENV } from "./config/env";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
app.disable("x-powered-by");

// Compression middleware: compress all responses (gzip/deflate)
app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
    level: 6,
  })
);

// Middleware
const allowedOrigins = ENV.CORS_ORIGIN === "*"
  ? "*"
  : ENV.CORS_ORIGIN.includes(",")
  ? ENV.CORS_ORIGIN.split(",").map((o) => o.trim())
  : ENV.CORS_ORIGIN;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static uploads with aggressive caching (7 days, etag, immutable)
app.use(
  "/uploads",
  express.static(path.resolve(process.cwd(), ENV.UPLOAD_DIR), {
    maxAge: "7d",
    etag: true,
    immutable: true,
  })
);

// Mount API routes
app.use("/api", apiRoutes);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", app: "Coffee Shop POS Backend", timestamp: new Date().toISOString() });
});

// Global Error Handler
app.use(errorHandler);

// Start Server if not imported as module
if (ENV.NODE_ENV !== "test") {
  app.listen(ENV.PORT, () => {
    console.log(`☕ Coffee Shop POS Backend running at http://localhost:${ENV.PORT}`);
    console.log(`📁 Uploads available at http://localhost:${ENV.PORT}/uploads`);
  });
}

export default app;