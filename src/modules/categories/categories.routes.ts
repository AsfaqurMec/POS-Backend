import { Router } from "express";
import { categoriesController } from "./categories.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { createUploader } from "../../middleware/upload";

const router = Router();
const upload = createUploader("categories");

router.get("/", (req, res, next) => categoriesController.listCategories(req, res, next));
router.get("/:id", (req, res, next) => categoriesController.getCategory(req, res, next));

router.post("/", authenticate, authorize(["ADMIN"]), upload.single("image"), (req, res, next) =>
  categoriesController.createCategory(req, res, next)
);

router.patch("/:id", authenticate, authorize(["ADMIN"]), upload.single("image"), (req, res, next) =>
  categoriesController.updateCategory(req, res, next)
);

router.patch("/:id/status", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  categoriesController.toggleStatus(req, res, next)
);

router.delete("/:id", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  categoriesController.deleteCategory(req, res, next)
);

export default router;