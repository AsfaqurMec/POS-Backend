"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const kds_controller_1 = require("./kds.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Stream endpoint does not require auth header so EventSource can easily connect without extra headers, or we can allow query token
router.get("/stream", (req, res) => kds_controller_1.kdsController.streamEvents(req, res));
router.use(auth_1.authenticate);
router.get("/orders", (req, res, next) => kds_controller_1.kdsController.getActiveOrders(req, res, next));
router.patch("/orders/:id/status", (req, res, next) => kds_controller_1.kdsController.updateOrderStatus(req, res, next));
exports.default = router;
