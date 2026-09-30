import { Router } from "express";
import { kdsController } from "./kds.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

// Stream endpoint does not require auth header so EventSource can easily connect without extra headers, or we can allow query token
router.get("/stream", (req, res) => kdsController.streamEvents(req, res));

router.use(authenticate);

router.get("/orders", (req, res, next) => kdsController.getActiveOrders(req, res, next));
router.patch("/orders/:id/status", (req, res, next) => kdsController.updateOrderStatus(req, res, next));

export default router;
