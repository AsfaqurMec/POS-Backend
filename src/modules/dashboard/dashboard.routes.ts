import { Router } from "express";
import { dashboardController } from "./dashboard.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);
router.use(authorize(["ADMIN", "GUEST"]));

router.get("/stats", (req, res, next) => dashboardController.getDashboardStats(req, res, next));

export default router;
