import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/response";
import { businessService } from "../business/business.service";

export class RecipesService {
  async listIngredients() {
    const business = await businessService.getBusiness();
    const ingredients = await prisma.ingredient.findMany({
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

  async createIngredient(data: {
    nameEn: string;
    nameAr: string;
    unit: string;
    costPerUnit: number;
    currentStock: number;
    reorderLevel: number;
  }) {
    const business = await businessService.getBusiness();

    const ing = await prisma.ingredient.create({
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

  async updateIngredient(
    id: string,
    data: {
      nameEn?: string;
      nameAr?: string;
      unit?: string;
      costPerUnit?: number;
      currentStock?: number;
      reorderLevel?: number;
    }
  ) {
    const updated = await prisma.ingredient.update({
      where: { id },
      data: {
        ...data,
      },
    });
    return updated;
  }

  async getRecipe(itemId: string) {
    const recipes = await prisma.recipeItem.findMany({
      where: { itemId },
      include: {
        ingredient: true,
      },
    });
    return recipes;
  }

  async setRecipe(
    itemId: string,
    ingredients: { ingredientId: string; quantityRequired: number }[]
  ) {
    return prisma.$transaction(async (tx) => {
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

  async logWastage(
    userId: string,
    data: {
      ingredientId?: string;
      itemId?: string;
      quantity: number;
      reason: string;
      notes?: string;
    }
  ) {
    if (!data.quantity || data.quantity <= 0) {
      throw new AppError("INVALID_QUANTITY", "Quantity must be greater than zero", 400);
    }
    if (!data.reason) {
      throw new AppError("REASON_REQUIRED", "Waste reason is mandatory", 400);
    }

    const business = await businessService.getBusiness();
    let calculatedCost = 0;

    return prisma.$transaction(async (tx) => {
      // If ingredient waste (e.g. coffee beans dial-in, milk spillage)
      if (data.ingredientId) {
        const ing = await tx.ingredient.findUnique({ where: { id: data.ingredientId } });
        if (!ing) throw new AppError("NOT_FOUND", "Ingredient not found", 404);

        calculatedCost = data.quantity * ing.costPerUnit;

        await tx.ingredient.update({
          where: { id: data.ingredientId },
          data: { currentStock: { decrement: data.quantity } },
        });
      } else if (data.itemId) {
        // If finished product waste (e.g. dropped croissant, bad espresso shot)
        const item = await tx.item.findUnique({ where: { id: data.itemId } });
        if (!item) throw new AppError("NOT_FOUND", "Item not found", 404);

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

  async listWasteLogs(limit: number = 50, page: number = 1) {
    const take = Math.max(1, Math.min(100, limit));
    const skip = (Math.max(1, page) - 1) * take;

    const [logs, total] = await Promise.all([
      prisma.wasteLog.findMany({
        take,
        skip,
        include: {
          ingredient: true,
          item: { select: { id: true, nameEn: true, nameAr: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.wasteLog.count(),
    ]);

    const totalCostAgg = await prisma.wasteLog.aggregate({
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

export const recipesService = new RecipesService();
