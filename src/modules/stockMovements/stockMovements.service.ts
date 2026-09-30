import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/response";

export interface StockMovementFilters {
  itemId?: string;
  variantId?: string;
  type?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CreateManualMovementDto {
  itemId: string;
  variantId?: string | null;
  type: "RESTOCK" | "DAMAGE" | "ADJUSTMENT" | "RETURN";
  quantity?: number;
  newStock?: number;
  reason?: string;
  referenceId?: string;
}

export class StockMovementsService {
  async listMovements(filters: StockMovementFilters = {}) {
    const page = Math.max(1, filters.page || 1);
    const limit = Math.min(100, Math.max(1, filters.limit || 50));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.itemId && filters.itemId !== "ALL") {
      where.itemId = filters.itemId;
    }

    if (filters.variantId && filters.variantId !== "ALL") {
      where.variantId = filters.variantId;
    }

    if (filters.type && filters.type !== "ALL") {
      where.type = filters.type;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { item: { nameEn: { contains: q, mode: "insensitive" } } },
        { item: { nameAr: { contains: q, mode: "insensitive" } } },
        { item: { sku: { contains: q, mode: "insensitive" } } },
        { item: { barcode: { contains: q, mode: "insensitive" } } },
        { referenceId: { contains: q, mode: "insensitive" } },
        { reason: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: {
          item: {
            select: {
              id: true,
              nameEn: true,
              nameAr: true,
              imageUrl: true,
              sku: true,
              barcode: true,
              basePrice: true,
              stockQuantity: true,
              category: { select: { id: true, nameEn: true, nameAr: true } },
            },
          },
          variant: {
            include: {
              variantOptions: {
                include: {
                  variationGroup: { select: { nameEn: true, nameAr: true } },
                  variationOption: { select: { nameEn: true, nameAr: true } },
                },
              },
            },
          },
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    // Aggregate summary stats for the active filter set
    const allMatching = await prisma.stockMovement.findMany({
      where,
      select: { type: true, quantity: true, createdAt: true },
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let totalInflow = 0;
    let totalOutflow = 0;
    let todayCount = 0;

    for (const m of allMatching) {
      if (m.quantity > 0) {
        totalInflow += m.quantity;
      } else {
        totalOutflow += Math.abs(m.quantity);
      }
      if (m.createdAt >= todayStart) {
        todayCount++;
      }
    }

    return {
      movements,
      total,
      page,
      limit,
      stats: {
        totalMovements: total,
        totalInflow,
        totalOutflow,
        netChange: totalInflow - totalOutflow,
        todayCount,
      },
    };
  }

  async createManualMovement(userId: string, data: CreateManualMovementDto) {
    const { itemId, variantId, type, quantity, newStock, reason, referenceId } = data;

    if (!itemId) {
      throw new AppError("ITEM_REQUIRED", "Item ID is required", 400);
    }

    const validTypes = ["RESTOCK", "DAMAGE", "ADJUSTMENT", "RETURN"];
    if (!validTypes.includes(type)) {
      throw new AppError("INVALID_TYPE", `Movement type must be one of: ${validTypes.join(", ")}`, 400);
    }

    return prisma.$transaction(async (tx) => {
      let previousStock = 0;
      let finalStock = 0;
      let delta = 0;

      if (variantId) {
        const variant = await tx.productVariant.findUnique({
          where: { id: variantId },
          include: { item: true },
        });

        if (!variant || variant.itemId !== itemId) {
          throw new AppError("VARIANT_NOT_FOUND", "Specified product variant was not found", 404);
        }

        previousStock = variant.stockQuantity;

        if (newStock !== undefined && !isNaN(newStock)) {
          finalStock = Math.max(0, Math.floor(newStock));
          delta = finalStock - previousStock;
        } else if (quantity !== undefined && !isNaN(quantity)) {
          const qty = Math.floor(quantity);
          if (type === "RESTOCK" || type === "RETURN") {
            delta = Math.abs(qty);
            finalStock = previousStock + delta;
          } else if (type === "DAMAGE") {
            delta = -Math.abs(qty);
            finalStock = Math.max(0, previousStock + delta);
          } else {
            // ADJUSTMENT
            delta = qty;
            finalStock = Math.max(0, previousStock + delta);
          }
        } else {
          throw new AppError("QUANTITY_REQUIRED", "Provide valid quantity or new target stock", 400);
        }

        await tx.productVariant.update({
          where: { id: variantId },
          data: { stockQuantity: finalStock },
        });

        // Ensure item stockEnabled is true
        await tx.item.update({
          where: { id: itemId },
          data: { stockEnabled: true },
        });
      } else {
        const item = await tx.item.findUnique({ where: { id: itemId } });
        if (!item) {
          throw new AppError("ITEM_NOT_FOUND", "Item not found", 404);
        }

        previousStock = item.stockQuantity;

        if (newStock !== undefined && !isNaN(newStock)) {
          finalStock = Math.max(0, Math.floor(newStock));
          delta = finalStock - previousStock;
        } else if (quantity !== undefined && !isNaN(quantity)) {
          const qty = Math.floor(quantity);
          if (type === "RESTOCK" || type === "RETURN") {
            delta = Math.abs(qty);
            finalStock = previousStock + delta;
          } else if (type === "DAMAGE") {
            delta = -Math.abs(qty);
            finalStock = Math.max(0, previousStock + delta);
          } else {
            // ADJUSTMENT
            delta = qty;
            finalStock = Math.max(0, previousStock + delta);
          }
        } else {
          throw new AppError("QUANTITY_REQUIRED", "Provide valid quantity or new target stock", 400);
        }

        await tx.item.update({
          where: { id: itemId },
          data: { stockQuantity: finalStock, stockEnabled: true },
        });
      }

      const movement = await tx.stockMovement.create({
        data: {
          itemId,
          variantId: variantId || null,
          type,
          quantity: delta,
          previousStock,
          newStock: finalStock,
          referenceId: referenceId?.trim() || null,
          reason: reason?.trim() || `${type} adjustment`,
          userId,
        },
        include: {
          item: {
            select: { id: true, nameEn: true, nameAr: true, imageUrl: true, sku: true, barcode: true },
          },
          variant: {
            include: {
              variantOptions: {
                include: { variationGroup: true, variationOption: true },
              },
            },
          },
          user: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
      });

      return movement;
    });
  }
}

export const stockMovementsService = new StockMovementsService();
