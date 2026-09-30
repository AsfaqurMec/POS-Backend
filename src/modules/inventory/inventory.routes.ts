import { Router } from "express";
import { inventoryController } from "./inventory.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.get("/", authenticate, (req, res, next) => inventoryController.getInventory(req, res, next));
router.patch("/:id", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  inventoryController.updateStock(req, res, next)
);

export default router;