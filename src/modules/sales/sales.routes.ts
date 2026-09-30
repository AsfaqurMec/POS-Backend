import { Router } from "express";
import { salesController } from "./sales.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.post("/", (req, res, next) => salesController.createSale(req as any, res, next));
router.get("/", (req, res, next) => salesController.listSales(req, res, next));
router.post("/hold", (req, res, next) => salesController.holdOrder(req as any, res, next));
router.get("/held", (req, res, next) => salesController.getHeldOrders(req, res, next));
router.delete("/held/:id", (req, res, next) => salesController.deleteHeldOrder(req, res, next));
router.post("/:id/void", (req, res, next) => salesController.voidSale(req as any, res, next));
router.get("/:id", (req, res, next) => salesController.getSale(req, res, next));

export default router;