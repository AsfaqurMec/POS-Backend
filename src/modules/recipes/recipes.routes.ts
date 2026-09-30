import { Router } from "express";
import { recipesController } from "./recipes.controller";
import { authenticate } from "../../middleware/auth";

const router = Router();

router.use(authenticate);

router.get("/ingredients", (req, res, next) => recipesController.listIngredients(req, res, next));
router.post("/ingredients", (req, res, next) => recipesController.createIngredient(req, res, next));
router.patch("/ingredients/:id", (req, res, next) => recipesController.updateIngredient(req, res, next));

router.get("/item/:itemId", (req, res, next) => recipesController.getRecipe(req, res, next));
router.put("/item/:itemId", (req, res, next) => recipesController.setRecipe(req, res, next));

router.post("/waste", (req, res, next) => recipesController.logWastage(req as any, res, next));
router.get("/waste", (req, res, next) => recipesController.listWasteLogs(req, res, next));

export default router;
