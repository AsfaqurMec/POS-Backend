import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";

const router = Router();

router.post("/login", (req, res, next) => authController.login(req, res, next));
router.post("/guest-login", (req, res, next) => authController.guestLogin(req, res, next));
router.post("/pin-login", (req, res, next) => authController.pinLogin(req, res, next));
router.post("/unlock-terminal", optionalAuthenticate, (req, res, next) => authController.unlockTerminal(req, res, next));
router.post("/verify-manager-pin", (req, res, next) => authController.verifyManagerPin(req, res, next));
router.patch("/pin", authenticate, (req, res, next) => authController.updatePin(req as any, res, next));
router.post("/logout", (req, res) => authController.logout(req, res));
router.get("/me", authenticate, (req, res, next) => authController.getMe(req, res, next));
router.patch("/password", authenticate, (req, res, next) => authController.changePassword(req, res, next));

export default router;