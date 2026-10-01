"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("./inventory.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticate, (req, res, next) => inventory_controller_1.inventoryController.getInventory(req, res, next));
router.patch("/:id", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN"]), (req, res, next) => inventory_controller_1.inventoryController.updateStock(req, res, next));
exports.default = router;
