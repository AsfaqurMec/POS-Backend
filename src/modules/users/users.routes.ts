import { Router } from "express";
import { usersController } from "./users.controller";
import { authenticate, authorize } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/", authorize(["ADMIN", "GUEST"]), (req, res, next) => usersController.listUsers(req, res, next));
router.get("/:id", authorize(["ADMIN", "GUEST"]), (req, res, next) => usersController.getUser(req, res, next));
router.post("/", authorize(["ADMIN"]), (req, res, next) => usersController.createUser(req, res, next));
router.patch("/:id", authorize(["ADMIN"]), (req, res, next) => usersController.updateUser(req, res, next));
router.patch("/:id/status", authorize(["ADMIN"]), (req, res, next) => usersController.toggleStatus(req, res, next));
router.patch("/:id/pin", authorize(["ADMIN"]), (req, res, next) => usersController.updateUserPin(req, res, next));

export default router;