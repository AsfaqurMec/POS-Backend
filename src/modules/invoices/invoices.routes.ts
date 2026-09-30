import { Router } from "express";
import { invoicesController } from "./invoices.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", (req, res, next) => invoicesController.listInvoices(req, res, next));
router.get("/:id", (req, res, next) => invoicesController.getInvoice(req, res, next));

export default router;