"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recipesService = exports.RecipesService = void 0;
const prisma_1 = require("../../config/prisma");
const response_1 = require("../../utils/response");
const business_service_1 = require("../business/business.service");
class RecipesService {
    async listIngredients() {
        const business = await business_service_1.businessService.getBusiness();
        const ingredients = await prisma_1.prisma.ingredient.findMany({
            where: { businessId: business.id },
            include: {
                recipes: {
                    include: {
                        item: { select: { id: true, nameEn: true, nameAr: true } },
                    },
                },
            },
            orderBy: { nameEn: "asc" },
        });
        return ingredients.map((ing) => ({
            ...ing,
            isLowStock: ing.currentStock <= ing.reorderLevel,
            stockValuation: ing.currentStock * ing.costPerUnit,
        }));
    }
    async createIngredient(data) {
        const business = await business_service_1.businessService.getBusiness();
        const ing = await prisma_1.prisma.ingredient.create({
            data: {
                businessId: business.id,
                nameEn: data.nameEn.trim(),
                nameAr: data.nameAr.trim(),
                unit: data.unit.toUpperCase().trim(),
                costPerUnit: Math.max(0, Number(data.costPerUnit) || 0),
                currentStock: Math.max(0, Number(data.currentStock) || 0),
                reorderLevel: Math.max(0, Number(data.reorderLevel) || 0),
            },
        });
        return ing;
    }
    async updateIngredient(id, data) {
        const updated = await prisma_1.prisma.ingredient.update({
            where: { id },
            data: {
                ...data,
            },
        });
        return updated;
    }
    async getRecipe(itemId) {
        const recipes = await prisma_1.prisma.recipeItem.findMany({
            where: { itemId },
            include: {
                ingredient: true,
            },
        });
        return recipes;
    }
    async setRecipe(itemId, ingredients) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.recipeItem.deleteMany({ where: { itemId } });
            if (ingredients.length > 0) {
                await tx.recipeItem.createMany({
                    data: ingredients.map((ing) => ({
                        itemId,
                        ingredientId: ing.ingredientId,
                        quantityRequired: Math.max(0, Number(ing.quantityRequired) || 0),
                    })),
                });
            }
            return tx.recipeItem.findMany({
                where: { itemId },
                include: { ingredient: true },
            });
        });
    }
    async logWastage(userId, data) {
        if (!data.quantity || data.quantity <= 0) {
            throw new response_1.AppError("INVALID_QUANTITY", "Quantity must be greater than zero", 400);
        }
        if (!data.reason) {
            throw new response_1.AppError("REASON_REQUIRED", "Waste reason is mandatory", 400);
        }
        const business = await business_service_1.businessService.getBusiness();
        let calculatedCost = 0;
        return prisma_1.prisma.$transaction(async (tx) => {
            // If ingredient waste (e.g. coffee beans dial-in, milk spillage)
            if (data.ingredientId) {
                const ing = await tx.ingredient.findUnique({ where: { id: data.ingredientId } });
                if (!ing)
                    throw new response_1.AppError("NOT_FOUND", "Ingredient not found", 404);
                calculatedCost = data.quantity * ing.costPerUnit;
                await tx.ingredient.update({
                    where: { id: data.ingredientId },
                    data: { currentStock: { decrement: data.quantity } },
                });
            }
            else if (data.itemId) {
                // If finished product waste (e.g. dropped croissant, bad espresso shot)
                const item = await tx.item.findUnique({ where: { id: data.itemId } });
                if (!item)
                    throw new response_1.AppError("NOT_FOUND", "Item not found", 404);
                calculatedCost = data.quantity * item.basePrice;
                if (item.stockEnabled) {
                    const updatedItem = await tx.item.update({
                        where: { id: data.itemId },
                        data: { stockQuantity: { decrement: data.quantity } },
                    });
                    await tx.stockMovement.create({
                        data: {
                            itemId: item.id,
                            type: "DAMAGE",
                            quantity: -data.quantity,
                            previousStock: updatedItem.stockQuantity + data.quantity,
                            newStock: updatedItem.stockQuantity,
                            reason: `Wastage: ${data.reason}`,
                            userId,
                        },
                    });
                }
            }
            const wasteLog = await tx.wasteLog.create({
                data: {
                    businessId: business.id,
                    ingredientId: data.ingredientId || null,
                    itemId: data.itemId || null,
                    quantity: data.quantity,
                    cost: calculatedCost,
                    reason: data.reason,
                    notes: data.notes?.trim() || null,
                    userId,
                },
                include: {
                    ingredient: true,
                    item: true,
                },
            });
            return wasteLog;
        });
    }
    async listWasteLogs(limit = 50, page = 1) {
        const take = Math.max(1, Math.min(100, limit));
        const skip = (Math.max(1, page) - 1) * take;
        const [logs, total] = await Promise.all([
            prisma_1.prisma.wasteLog.findMany({
                take,
                skip,
                include: {
                    ingredient: true,
                    item: { select: { id: true, nameEn: true, nameAr: true } },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma_1.prisma.wasteLog.count(),
        ]);
        const totalCostAgg = await prisma_1.prisma.wasteLog.aggregate({
            _sum: { cost: true, quantity: true },
        });
        return {
            logs,
            total,
            page,
            limit: take,
            totalCostLost: totalCostAgg._sum.cost || 0,
            totalQuantityWasted: totalCostAgg._sum.quantity || 0,
        };
    }
}
exports.RecipesService = RecipesService;
exports.recipesService = new RecipesService();
