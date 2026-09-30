import express from "express";
import cors from "cors";
import path from "path";
import { ENV } from "./config/env";
import apiRoutes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
app.use("/uploads", express.static(path.resolve(process.cwd(), ENV.UPLOAD_DIR)));

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