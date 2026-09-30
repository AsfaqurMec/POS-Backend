import { Router } from "express";
import { stockMovementsController } from "./stockMovements.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", authorize(["ADMIN", "GUEST"]), (req, res, next) => stockMovementsController.listMovements(req, res, next));
router.post("/", authorize(["ADMIN"]), (req, res, next) => stockMovementsController.createManualMovement(req as any, res, next));

export default router;
