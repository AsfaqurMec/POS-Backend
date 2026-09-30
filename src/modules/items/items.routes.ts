import { Router } from "express";
import { itemsController } from "./items.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { createUploader } from "../../middleware/upload";

const router = Router();
const upload = createUploader("products");

router.get("/", (req, res, next) => itemsController.listItems(req, res, next));
router.get("/:id/stats", authenticate, authorize(["ADMIN", "GUEST"]), (req, res, next) =>
  itemsController.getItemStats(req, res, next)
);
router.get("/:id", (req, res, next) => itemsController.getItem(req, res, next));

router.post("/", authenticate, authorize(["ADMIN"]), upload.single("image"), (req, res, next) =>
  itemsController.createItem(req, res, next)
);

router.patch("/:id", authenticate, authorize(["ADMIN"]), upload.single("image"), (req, res, next) =>
  itemsController.updateItem(req, res, next)
);

router.patch("/:id/status", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  itemsController.toggleStatus(req, res, next)
);

router.delete("/:id", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  itemsController.deleteItem(req, res, next)
);

export default router;