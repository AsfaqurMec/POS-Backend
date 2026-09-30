import { Router } from "express";
import { variationsController } from "./variations.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

// Item Variation Groups
router.get("/items/:id/variation-groups", (req, res, next) =>
  variationsController.listGroups(req, res, next)
);
router.post("/items/:id/variation-groups", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  variationsController.createGroup(req, res, next)
);
router.patch("/variation-groups/:id", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  variationsController.updateGroup(req, res, next)
);
router.delete("/variation-groups/:id", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  variationsController.deleteGroup(req, res, next)
);

// Variation Options
router.post("/variation-groups/:id/options", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  variationsController.createOption(req, res, next)
);
router.patch("/variation-options/:id", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  variationsController.updateOption(req, res, next)
);
router.delete("/variation-options/:id", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  variationsController.deleteOption(req, res, next)
);

// Product Variants (Variant Mode)
router.get("/items/:id/variants", (req, res, next) =>
  variationsController.listVariants(req, res, next)
);
router.post("/items/:id/variants", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  variationsController.createVariant(req, res, next)
);
router.patch("/variants/:id", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  variationsController.updateVariant(req, res, next)
);
router.patch("/variants/:id/status", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  variationsController.toggleVariantStatus(req, res, next)
);
router.delete("/variants/:id", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  variationsController.deleteVariant(req, res, next)
);

// Variant Generation Endpoint
router.post("/items/:itemId/variants/generate", authenticate, authorize(["ADMIN"]), (req, res, next) =>
  variationsController.generateVariants(req, res, next)
);

export default router;