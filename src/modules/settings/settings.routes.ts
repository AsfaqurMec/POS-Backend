import { Router } from "express";
import { settingsController } from "./settings.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", authorize(["ADMIN", "GUEST"]), (req, res, next) => settingsController.getSettings(req, res, next));
router.patch("/business", authorize(["ADMIN"]), (req, res, next) => settingsController.updateBusiness(req, res, next));
router.patch("/invoice", authorize(["ADMIN"]), (req, res, next) => settingsController.updateInvoice(req, res, next));

export default router;