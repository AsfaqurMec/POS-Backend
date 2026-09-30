import { Router } from "express";
import { shiftsController } from "./shifts.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/open", (req, res, next) => shiftsController.openShift(req as any, res, next));
router.get("/current", (req, res, next) => shiftsController.getCurrentShift(req as any, res, next));
router.post("/cash-movement", (req, res, next) => shiftsController.addCashMovement(req as any, res, next));
router.post("/close", (req, res, next) => shiftsController.closeShift(req as any, res, next));
router.get("/:id/report", (req, res, next) => shiftsController.getShiftReport(req as any, res, next));

export default router;
