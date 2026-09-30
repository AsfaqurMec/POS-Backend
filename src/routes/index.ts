import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import businessRoutes from "../modules/business/business.routes";
import usersRoutes from "../modules/users/users.routes";
import categoriesRoutes from "../modules/categories/categories.routes";
import itemsRoutes from "../modules/items/items.routes";
import variationsRoutes from "../modules/variations/variations.routes";
import inventoryRoutes from "../modules/inventory/inventory.routes";
import salesRoutes from "../modules/sales/sales.routes";
import invoicesRoutes from "../modules/invoices/invoices.routes";
import settingsRoutes from "../modules/settings/settings.routes";
import dashboardRoutes from "../modules/dashboard/dashboard.routes";
import stockMovementsRoutes from "../modules/stockMovements/stockMovements.routes";
import shiftsRoutes from "../modules/shifts/shifts.routes";
import recipesRoutes from "../modules/recipes/recipes.routes";
import kdsRoutes from "../modules/kds/kds.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/business", businessRoutes);
router.use("/users", usersRoutes);
router.use("/categories", categoriesRoutes);
router.use("/items", itemsRoutes);
router.use("/", variationsRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/sales", salesRoutes);
router.use("/invoices", invoicesRoutes);
router.use("/settings", settingsRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/stock-movements", stockMovementsRoutes);
router.use("/shifts", shiftsRoutes);
router.use("/recipes", recipesRoutes);
router.use("/kds", kdsRoutes);

export default router;