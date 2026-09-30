import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/response";

export class InventoryService {
  async getInventory(search?: string) {
    const items = await prisma.item.findMany({
      where: {
        stockEnabled: true,
        ...(search
          ? {
              OR: [
                { nameEn: { contains: search, mode: "insensitive" } },
                { nameAr: { contains: search, mode: "insensitive" } },
                { sku: { contains: search, mode: "insensitive" } },
                { barcode: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        category: { select: { id: true, nameEn: true, nameAr: true } },
      },
      orderBy: { nameEn: "asc" },
    });

    const variants = await prisma.productVariant.findMany({
      where: {
        item: {
          variationMode: "VARIANT",
          ...(search
            ? {
                OR: [
                  { nameEn: { contains: search, mode: "insensitive" } },
                  { nameAr: { contains: search, mode: "insensitive" } },
                  { sku: { contains: search, mode: "insensitive" } },
                  { barcode: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
        },
      },
      include: {
        item: { select: { id: true, nameEn: true, nameAr: true, category: true, imageUrl: true } },
        variantOptions: {
          include: { variationGroup: true, variationOption: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Formatted list for real inventory dashboard
    const inventoryList = [
      ...items
        .filter((i) => i.variationMode !== "VARIANT")
        .map((i) => ({
          id: i.id,
          type: "ITEM" as const,
          itemId: i.id,
          nameEn: i.nameEn,
          nameAr: i.nameAr,
          categoryId: i.categoryId,
          categoryEn: i.category?.nameEn || "-",
          categoryAr: i.category?.nameAr || "-",
          imageUrl: i.imageUrl,
          basePrice: i.basePrice,
          sku: i.sku || "-",
          barcode: i.barcode || "-",
          stockQuantity: i.stockQuantity,
          status: i.stockQuantity === 0 ? ("OUT_OF_STOCK" as const) : i.stockQuantity <= 5 ? ("LOW" as const) : ("IN_STOCK" as const),
          valuation: i.stockQuantity * i.basePrice,
          active: i.active,
        })),
      ...variants.map((v) => {
        const comboEn = v.variantOptions.map((vo) => vo.variationOption.nameEn).join(" / ");
        const comboAr = v.variantOptions.map((vo) => vo.variationOption.nameAr).join(" / ");
        return {
          id: v.id,
          type: "VARIANT" as const,
          itemId: v.itemId,
          nameEn: `${v.item.nameEn} (${comboEn})`,
          nameAr: `${v.item.nameAr} (${comboAr})`,
          categoryId: v.item.category?.id || "-",
          categoryEn: v.item.category?.nameEn || "-",
          categoryAr: v.item.category?.nameAr || "-",
          imageUrl: v.imageUrl || v.item.imageUrl,
          basePrice: v.price,
          sku: v.sku || "-",
          barcode: v.barcode || "-",
          stockQuantity: v.stockQuantity,
          status: v.stockQuantity === 0 ? ("OUT_OF_STOCK" as const) : v.stockQuantity <= 5 ? ("LOW" as const) : ("IN_STOCK" as const),
          valuation: v.stockQuantity * v.price,
          active: v.active,
        };
      }),
    ];

    return inventoryList;
  }

  async updateStock(
    id: string,
    type: "ITEM" | "VARIANT",
    newQuantity?: number,
    delta?: number,
    movementType?: string,
    reason?: string,
    userId?: string
  ) {
    return prisma.$transaction(async (tx) => {
      let previousStock = 0;
      let targetQuantity: number;
      let calculatedDelta = 0;
      let itemId: string;
      let variantId: string | null = null;

      if (type === "VARIANT") {
        const variant = await tx.productVariant.findUnique({ where: { id } });
        if (!variant) throw new AppError("VARIANT_NOT_FOUND", "Variant not found", 404);
        previousStock = variant.stockQuantity;
        itemId = variant.itemId;
        variantId = variant.id;

        if (delta !== undefined && !isNaN(delta)) {
          calculatedDelta = delta;
          targetQuantity = Math.max(0, variant.stockQuantity + delta);
        } else if (newQuantity !== undefined && !isNaN(newQuantity)) {
          if (newQuantity < 0) {
            throw new AppError("INVALID_STOCK", "Stock quantity must be a non-negative number", 400);
          }
          targetQuantity = newQuantity;
          calculatedDelta = targetQuantity - previousStock;
        } else {
          throw new AppError("INVALID_STOCK", "Provide valid new quantity or delta", 400);
        }

        const updated = await tx.productVariant.update({
          where: { id },
          data: { stockQuantity: targetQuantity },
        });

        await tx.item.update({
          where: { id: itemId },
          data: { stockEnabled: true },
        });

        const mType = movementType || (calculatedDelta >= 0 ? "RESTOCK" : "ADJUSTMENT");
        await tx.stockMovement.create({
          data: {
            itemId,
            variantId,
            type: mType,
            quantity: calculatedDelta,
            previousStock,
            newStock: targetQuantity,
            reason: reason || `Manual ${mType.toLowerCase()} via inventory`,
            userId: userId || null,
          },
        });

        return updated;
      } else {
        const item = await tx.item.findUnique({ where: { id } });
        if (!item) throw new AppError("ITEM_NOT_FOUND", "Item not found", 404);
        previousStock = item.stockQuantity;
        itemId = item.id;

        if (delta !== undefined && !isNaN(delta)) {
          calculatedDelta = delta;
          targetQuantity = Math.max(0, item.stockQuantity + delta);
        } else if (newQuantity !== undefined && !isNaN(newQuantity)) {
          if (newQuantity < 0) {
            throw new AppError("INVALID_STOCK", "Stock quantity must be a non-negative number", 400);
          }
          targetQuantity = newQuantity;
          calculatedDelta = targetQuantity - previousStock;
        } else {
          throw new AppError("INVALID_STOCK", "Provide valid new quantity or delta", 400);
        }

        const updated = await tx.item.update({
          where: { id },
          data: { stockQuantity: targetQuantity, stockEnabled: true },
        });

        const mType = movementType || (calculatedDelta >= 0 ? "RESTOCK" : "ADJUSTMENT");
        await tx.stockMovement.create({
          data: {
            itemId,
            variantId: null,
            type: mType,
            quantity: calculatedDelta,
            previousStock,
            newStock: targetQuantity,
            reason: reason || `Manual ${mType.toLowerCase()} via inventory`,
            userId: userId || null,
          },
        });

        return updated;
      }
    });
  }
}

export const inventoryService = new InventoryService();