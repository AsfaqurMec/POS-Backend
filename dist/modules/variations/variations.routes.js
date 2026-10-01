"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const variations_controller_1 = require("./variations.controller");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// Item Variation Groups
router.get("/items/:id/variation-groups", (req, res, next) => variations_controller_1.variationsController.listGroups(req, res, next));
router.post("/items/:id/variation-groups", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN"]), (req, res, next) => variations_controller_1.variationsController.createGroup(req, res, next));
router.patch("/variation-groups/:id", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN"]), (req, res, next) => variations_controller_1.variationsController.updateGroup(req, res, next));
router.delete("/variation-groups/:id", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN"]), (req, res, next) => variations_controller_1.variationsController.deleteGroup(req, res, next));
// Variation Options
router.post("/variation-groups/:id/options", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN"]), (req, res, next) => variations_controller_1.variationsController.createOption(req, res, next));
router.patch("/variation-options/:id", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN"]), (req, res, next) => variations_controller_1.variationsController.updateOption(req, res, next));
router.delete("/variation-options/:id", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN"]), (req, res, next) => variations_controller_1.variationsController.deleteOption(req, res, next));
// Product Variants (Variant Mode)
router.get("/items/:id/variants", (req, res, next) => variations_controller_1.variationsController.listVariants(req, res, next));
router.post("/items/:id/variants", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN"]), (req, res, next) => variations_controller_1.variationsController.createVariant(req, res, next));
router.patch("/variants/:id", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN"]), (req, res, next) => variations_controller_1.variationsController.updateVariant(req, res, next));
router.patch("/variants/:id/status", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN"]), (req, res, next) => variations_controller_1.variationsController.toggleVariantStatus(req, res, next));
router.delete("/variants/:id", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN"]), (req, res, next) => variations_controller_1.variationsController.deleteVariant(req, res, next));
// Variant Generation Endpoint
router.post("/items/:itemId/variants/generate", auth_1.authenticate, (0, auth_1.authorize)(["ADMIN"]), (req, res, next) => variations_controller_1.variationsController.generateVariants(req, res, next));
exports.default = router;
