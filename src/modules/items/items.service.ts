import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/response";
import { deleteUploadedFile } from "../../middleware/upload";
import { businessService } from "../business/business.service";

export interface ItemFilters {
  categoryId?: string;
  search?: string;
  activeOnly?: boolean;
  variationMode?: string;
}

export class ItemsService {
  async listItems(filters: ItemFilters = {}) {
    const where: any = {};

    if (filters.activeOnly !== false) {
      where.active = true;
    }

    if (filters.categoryId && filters.categoryId !== "all") {
      where.categoryId = filters.categoryId;
    }

    if (filters.variationMode) {
      where.variationMode = filters.variationMode;
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { nameEn: { contains: q, mode: "insensitive" } },
        { nameAr: { contains: q, mode: "insensitive" } },
        { sku: { contains: q, mode: "insensitive" } },
        { barcode: { contains: q, mode: "insensitive" } },
      ];
    }

    return prisma.item.findMany({
      where,
      include: {
        category: {
          select: { id: true, nameEn: true, nameAr: true },
        },
        variationGroups: {
          where: { active: true },
          orderBy: { sortOrder: "asc" },
          include: {
            options: {
              where: { active: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        variants: {
          where: { active: true },
          include: {
            variantOptions: {
              include: {
                variationGroup: true,
                variationOption: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getItem(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        variationGroups: {
          orderBy: { sortOrder: "asc" },
          include: {
            options: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        variants: {
          include: {
            variantOptions: {
              include: {
                variationGroup: true,
                variationOption: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      throw new AppError("ITEM_NOT_FOUND", "Item not found", 404);
    }

    return item;
  }

  async getItemStats(id: string) {
    const item = await this.getItem(id);

    const [saleItems, stockMovements] = await Promise.all([
      prisma.saleItem.findMany({
        where: {
          itemId: id,
          sale: { status: { in: ["COMPLETED", "PREPARING", "READY", "SERVED"] } },
        },
        include: {
          sale: {
            select: {
              id: true,
              orderNumber: true,
              createdAt: true,
              paymentMethod: true,
              orderType: true,
              invoice: { select: { invoiceNumber: true } },
              user: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.stockMovement.findMany({
        where: { itemId: id },
        include: {
          variant: {
            include: {
              variantOptions: {
                include: { variationGroup: true, variationOption: true },
              },
            },
          },
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const totalSoldUnits = saleItems.reduce((sum, si) => sum + si.quantity, 0);
    const totalRevenue = saleItems.reduce((sum, si) => sum + si.lineTotal, 0);

    let totalRestocked = 0;
    let totalDamaged = 0;
    let totalAdjusted = 0;

    for (const m of stockMovements) {
      if (m.type === "RESTOCK" || m.type === "RETURN") {
        totalRestocked += Math.abs(m.quantity);
      } else if (m.type === "DAMAGE") {
        totalDamaged += Math.abs(m.quantity);
      } else if (m.type === "ADJUSTMENT") {
        totalAdjusted += m.quantity;
      }
    }

    const currentValuation = (item.stockQuantity || 0) * (item.basePrice || 0);

    return {
      item,
      stats: {
        totalSoldUnits,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalRestocked,
        totalDamaged,
        totalAdjusted,
        currentStock: item.stockQuantity,
        currentValuation: Number(currentValuation.toFixed(2)),
        movementsCount: stockMovements.length,
        salesCount: saleItems.length,
      },
      recentMovements: stockMovements.slice(0, 15),
      recentSales: saleItems.slice(0, 10).map((si) => ({
        id: si.id,
        saleId: si.saleId,
        orderNumber: (si.sale as any).orderNumber || null,
        invoiceNumber: si.sale.invoice?.invoiceNumber || "INV",
        quantity: si.quantity,
        unitPrice: si.unitPrice,
        lineTotal: si.lineTotal,
        paymentMethod: si.sale.paymentMethod,
        orderType: si.sale.orderType,
        cashierName: si.sale.user?.name || "Staff",
        date: si.sale.createdAt,
      })),
    };
  }

  async createItem(data: any, file?: Express.Multer.File) {
    const business = await businessService.getBusiness();

    let imageUrl: string | null = null;
    if (file) {
      imageUrl = `/uploads/products/${file.filename}`;
    }

    const basePrice = parseFloat(data.basePrice);
    if (isNaN(basePrice) || basePrice < 0) {
      throw new AppError("INVALID_PRICE", "Base price must be a valid positive number", 400);
    }

    const variationMode = data.variationMode || "NONE";
    const stockEnabled = data.stockEnabled === true || data.stockEnabled === "true";
    const stockQuantity = data.stockQuantity ? parseInt(data.stockQuantity, 10) : 0;

    return prisma.item.create({
      data: {
        businessId: business.id,
        categoryId: data.categoryId,
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        descriptionEn: data.descriptionEn || null,
        descriptionAr: data.descriptionAr || null,
        type: data.type || "PRODUCT",
        basePrice,
        sku: data.sku || null,
        barcode: data.barcode || null,
        stockEnabled,
        stockQuantity: isNaN(stockQuantity) ? 0 : stockQuantity,
        variationMode,
        active: data.active !== undefined ? Boolean(data.active === true || data.active === "true") : true,
        imageUrl,
      },
      include: {
        category: true,
        variationGroups: true,
        variants: true,
      },
    });
  }

  async updateItem(id: string, data: any, file?: Express.Multer.File) {
    const current = await prisma.item.findUnique({ where: { id } });
    if (!current) {
      throw new AppError("ITEM_NOT_FOUND", "Item not found", 404);
    }

    let imageUrl = current.imageUrl;
    if (file) {
      const newPath = `/uploads/products/${file.filename}`;
      if (current.imageUrl) {
        deleteUploadedFile(current.imageUrl);
      }
      imageUrl = newPath;
    } else if (data.removeImage === true || data.removeImage === "true") {
      if (current.imageUrl) {
        deleteUploadedFile(current.imageUrl);
      }
      imageUrl = null;
    }

    let basePrice = current.basePrice;
    if (data.basePrice !== undefined) {
      const parsed = parseFloat(data.basePrice);
      if (!isNaN(parsed) && parsed >= 0) {
        basePrice = parsed;
      }
    }

    return prisma.item.update({
      where: { id },
      data: {
        categoryId: data.categoryId ?? current.categoryId,
        nameEn: data.nameEn ?? current.nameEn,
        nameAr: data.nameAr ?? current.nameAr,
        descriptionEn: data.descriptionEn !== undefined ? data.descriptionEn : current.descriptionEn,
        descriptionAr: data.descriptionAr !== undefined ? data.descriptionAr : current.descriptionAr,
        type: data.type ?? current.type,
        basePrice,
        sku: data.sku !== undefined ? data.sku : current.sku,
        barcode: data.barcode !== undefined ? data.barcode : current.barcode,
        stockEnabled: data.stockEnabled !== undefined ? Boolean(data.stockEnabled === true || data.stockEnabled === "true") : current.stockEnabled,
        stockQuantity: data.stockQuantity !== undefined ? parseInt(data.stockQuantity, 10) : current.stockQuantity,
        variationMode: data.variationMode ?? current.variationMode,
        active: data.active !== undefined ? Boolean(data.active === true || data.active === "true") : current.active,
        imageUrl,
      },
      include: {
        category: true,
        variationGroups: {
          include: { options: true },
        },
        variants: true,
      },
    });
  }

  async toggleStatus(id: string, active?: boolean) {
    const current = await prisma.item.findUnique({ where: { id } });
    if (!current) {
      throw new AppError("ITEM_NOT_FOUND", "Item not found", 404);
    }

    const newActive = active !== undefined ? active : !current.active;
    return prisma.item.update({
      where: { id },
      data: { active: newActive },
    });
  }

  async deleteItem(id: string) {
    const current = await prisma.item.findUnique({ where: { id } });
    if (!current) {
      throw new AppError("ITEM_NOT_FOUND", "Item not found", 404);
    }

    if (current.imageUrl) {
      deleteUploadedFile(current.imageUrl);
    }

    await prisma.item.delete({ where: { id } });
    return { success: true };
  }
}

export const itemsService = new ItemsService();