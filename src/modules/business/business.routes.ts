import { Router } from "express";
import { businessController } from "./business.controller";
import { authenticate, authorize } from "../../middleware/auth";
import { createUploader } from "../../middleware/upload";

const router = Router();
const upload = createUploader("businesses");

router.get("/", (req, res, next) => businessController.getBusiness(req, res, next));
router.patch("/", authenticate, authorize(["ADMIN"]), upload.single("logo"), (req, res, next) =>
  businessController.updateBusiness(req, res, next)
);

export default router;