import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/response";
import { verifyManagerToken } from "../../utils/jwt";
import { businessService } from "../business/business.service";
import { kdsBroadcaster } from "../kds/kds.service";

export interface CreateSaleItemDto {
  itemId: string;
  variantId?: string | null;
  quantity: number;
  selectedOptionIds?: string[];
}

export interface CreateSalePaymentDto {
  paymentMethod: "CASH" | "CARD" | "MOBILE_PAY" | "OTHER";
  amount: number;
  reference?: string;
}

export interface CreateSaleDto {
  items: CreateSaleItemDto[];
  discountType?: "NONE" | "PERCENTAGE" | "FIXED";
  discountValue?: number;
  paymentMethod?: "CASH" | "CARD" | "MOBILE_PAY" | "SPLIT" | "LOYALTY" | "OTHER";
  payments?: CreateSalePaymentDto[];
  orderType?: "TAKEAWAY" | "DINE_IN" | "DELIVERY";
  customerName?: string;
  customerPhone?: string;
  tag?: string;
}

export class SalesService {
  async createSale(userId: string, data: CreateSaleDto) {
    if (!data.items || data.items.length === 0) {
      throw new AppError("EMPTY_CART", "Cannot process a sale with an empty cart", 400);
    }

    const business = await businessService.getBusiness();

    // 1. Process and validate all items
    const preparedItems: any[] = [];
    let subtotal = 0;

    for (const itemDto of data.items) {
      const quantity = Math.max(1, Math.floor(itemDto.quantity || 1));

      const item = await prisma.item.findUnique({
        where: { id: itemDto.itemId },
        include: {
          recipes: true,
          variationGroups: {
            where: { active: true },
            include: {
              options: { where: { active: true } },
            },
          },
          variants: {
            where: { active: true },
            include: {
              recipes: true,
              variantOptions: {
                include: { variationGroup: true, variationOption: true },
              },
            },
          },
        },
      });

      if (!item || !item.active) {
        throw new AppError("ITEM_NOT_FOUND", `Item ${itemDto.itemId} is inactive or not found`, 404);
      }

      let baseUnitPrice = item.basePrice;
      let unitPrice = item.basePrice;
      let variationAmount = 0;
      let selectedOptionSnapshots: any[] = [];
      let variantToDeduct: any = null;

      if (item.variationMode === "VARIANT") {
        if (!itemDto.variantId) {
          throw new AppError("INVALID_VARIANT", `Variant ID is required for ${item.nameEn}`, 400);
        }

        const variant = item.variants.find((v) => v.id === itemDto.variantId);
        if (!variant || !variant.active) {
          throw new AppError(
            "INVALID_VARIANT",
            `Selected variant combination is invalid or unavailable for ${item.nameEn}`,
            400
          );
        }

        // Check variant stock
        if (item.stockEnabled) {
          if (variant.stockQuantity < quantity) {
            throw new AppError(
              "INSUFFICIENT_STOCK",
              `Insufficient stock for "${item.nameEn}". Available: ${variant.stockQuantity}, Requested: ${quantity}`,
              400
            );
          }
          variantToDeduct = variant;
        }

        baseUnitPrice = variant.price;
        unitPrice = variant.price;

        // Collect snapshots from variant options
        selectedOptionSnapshots = variant.variantOptions.map((vo) => ({
          variationGroupNameEn: vo.variationGroup.nameEn,
          variationGroupNameAr: vo.variationGroup.nameAr,
          optionNameEn: vo.variationOption.nameEn,
          optionNameAr: vo.variationOption.nameAr,
          priceAdjustment: 0.0,
        }));
      } else if (item.variationMode === "OPTION") {
        // Validate required variation groups
        const selectedOptIds = new Set(itemDto.selectedOptionIds || []);

        for (const group of item.variationGroups) {
          const groupOptIds = group.options.map((o) => o.id);
          const selectedInGroup = groupOptIds.filter((id) => selectedOptIds.has(id));

          if (group.required && selectedInGroup.length === 0) {
            throw new AppError(
              "INVALID_VARIATION",
              `Required option group "${group.nameEn}" must be selected for ${item.nameEn}`,
              400
            );
          }

          if (group.selectionType === "SINGLE" && selectedInGroup.length > 1) {
            throw new AppError(
              "INVALID_VARIATION",
              `Only one option can be selected for "${group.nameEn}" in ${item.nameEn}`,
              400
            );
          }
        }

        // Calculate option adjustments and record snapshots
        for (const optId of selectedOptIds) {
          let found = false;
          for (const group of item.variationGroups) {
            const opt = group.options.find((o) => o.id === optId);
            if (opt) {
              found = true;
              variationAmount += opt.priceAdjustment;
              selectedOptionSnapshots.push({
                variationGroupNameEn: group.nameEn,
                variationGroupNameAr: group.nameAr,
                optionNameEn: opt.nameEn,
                optionNameAr: opt.nameAr,
                priceAdjustment: opt.priceAdjustment,
              });
              break;
            }
          }
          if (!found) {
            throw new AppError("INVALID_VARIATION", `Invalid variation option selected for ${item.nameEn}`, 400);
          }
        }

        unitPrice = item.basePrice + variationAmount;

        // Check base item stock if enabled
        if (item.stockEnabled) {
          if (item.stockQuantity < quantity) {
            throw new AppError(
              "INSUFFICIENT_STOCK",
              `Insufficient stock for "${item.nameEn}". Available: ${item.stockQuantity}, Requested: ${quantity}`,
              400
            );
          }
        }
      } else {
        // NONE mode
        if (item.stockEnabled) {
          if (item.stockQuantity < quantity) {
            throw new AppError(
              "INSUFFICIENT_STOCK",
              `Insufficient stock for "${item.nameEn}". Available: ${item.stockQuantity}, Requested: ${quantity}`,
              400
            );
          }
        }
        unitPrice = item.basePrice;
      }

      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;

      preparedItems.push({
        item,
        variantId: itemDto.variantId || null,
        variantToDeduct,
        quantity,
        baseUnitPrice,
        variationAmount,
        unitPrice,
        lineTotal,
        options: selectedOptionSnapshots,
      });
    }

    // 2. Calculate Discount
    const discountType = data.discountType || "NONE";
    const discountValue = Math.max(0, data.discountValue || 0);
    let discountAmount = 0;

    if (discountType === "PERCENTAGE") {
      const pct = Math.min(100, discountValue);
      discountAmount = (subtotal * pct) / 100;
    } else if (discountType === "FIXED") {
      discountAmount = Math.min(subtotal, discountValue);
    }

    const netSubtotal = Math.max(0, subtotal - discountAmount);

    // 3. Calculate Tax if enabled
    let taxAmount = 0;
    let totalAmount = netSubtotal;

    if (business.taxEnabled && business.taxRate > 0) {
      if (business.pricingMode === "EXCLUSIVE") {
        taxAmount = (netSubtotal * business.taxRate) / 100;
        totalAmount = netSubtotal + taxAmount;
      } else {
        // Inclusive
        taxAmount = netSubtotal - netSubtotal / (1 + business.taxRate / 100);
        totalAmount = netSubtotal;
      }
    }

    const paymentMethod = data.paymentMethod || "CASH";
    const orderType = data.orderType || "TAKEAWAY";
    const customerName = data.customerName?.trim() || null;
    const customerPhone = data.customerPhone?.trim() || null;

    // Look up cashier details
    const cashierUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true },
    });
    const cashierName = cashierUser?.name || "Staff";

    // Format current date and time
    const now = new Date();
    const issueDate = now.toISOString().split("T")[0];
    const issueTime = now.toLocaleTimeString("en-US", { hour12: false });

    // 4. ATOMIC PRISMA TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      // Step A: Atomic sequence increment for invoice number
      let seq = await tx.invoiceSequence.findFirst();
      if (!seq) {
        seq = await tx.invoiceSequence.create({
          data: { prefix: business.invoicePrefix || "INV-", currentNumber: 100 },
        });
      }

      const nextNum = seq.currentNumber + 1;
      await tx.invoiceSequence.update({
        where: { id: seq.id },
        data: { currentNumber: nextNum },
      });

      const invoiceNumber = `${seq.prefix}${String(nextNum).padStart(6, "0")}`;
      const orderNumber = `ORD-${String(nextNum).padStart(6, "0")}`;

      // Step B: Decrement inventory atomically & record StockMovement audit ledger
      for (const p of preparedItems) {
        if (p.item.stockEnabled) {
          if (p.variantToDeduct) {
            const updatedVar = await tx.productVariant.update({
              where: { id: p.variantToDeduct.id },
              data: { stockQuantity: { decrement: p.quantity } },
            });

            await tx.stockMovement.create({
              data: {
                itemId: p.item.id,
                variantId: p.variantToDeduct.id,
                type: "SALE",
                quantity: -p.quantity,
                previousStock: updatedVar.stockQuantity + p.quantity,
                newStock: updatedVar.stockQuantity,
                referenceId: invoiceNumber,
                reason: `Sale ${invoiceNumber}`,
                userId,
              },
            });
          } else {
            const updatedItem = await tx.item.update({
              where: { id: p.item.id },
              data: { stockQuantity: { decrement: p.quantity } },
            });

            await tx.stockMovement.create({
              data: {
                itemId: p.item.id,
                variantId: null,
                type: "SALE",
                quantity: -p.quantity,
                previousStock: updatedItem.stockQuantity + p.quantity,
                newStock: updatedItem.stockQuantity,
                referenceId: invoiceNumber,
                reason: `Sale ${invoiceNumber}`,
                userId,
              },
            });
          }
        }

        // Decrement recipe raw ingredients (BOM)
        const recipes = p.variantToDeduct?.recipes || p.item.recipes || [];
        for (const r of recipes) {
          const deduction = r.quantityRequired * p.quantity;
          await tx.ingredient.update({
            where: { id: r.ingredientId },
            data: { currentStock: { decrement: deduction } },
          }).catch(() => null);
        }
      }

      // Step C: Look up active cashier shift
      const activeShift = await tx.shift.findFirst({
        where: { userId, status: "OPEN" },
        orderBy: { openedAt: "desc" },
      });

      // Step D: Create Sale
      const sale = await tx.sale.create({
        data: {
          businessId: business.id,
          userId,
          shiftId: activeShift?.id || null,
          orderNumber,
          customerName,
          customerPhone,
          subtotal,
          discountType,
          discountValue,
          discountAmount,
          taxAmount,
          totalAmount,
          paymentMethod,
          orderType,
          status: "COMPLETED",
          payments: data.payments && data.payments.length > 0 ? {
            create: data.payments.map((pm) => ({
              paymentMethod: pm.paymentMethod,
              amount: pm.amount,
              reference: pm.reference || null,
            })),
          } : undefined,
          items: {
            create: preparedItems.map((p) => ({
              itemId: p.item.id,
              variantId: p.variantId,
              itemNameEnSnapshot: p.item.nameEn,
              itemNameArSnapshot: p.item.nameAr,
              quantity: p.quantity,
              baseUnitPrice: p.baseUnitPrice,
              variationAmount: p.variationAmount,
              unitPrice: p.unitPrice,
              discountAmount: 0.0,
              lineTotal: p.lineTotal,
              options: {
                create: p.options,
              },
            })),
          },
        },
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          items: {
            include: { options: true, item: { select: { id: true, imageUrl: true } } },
          },
        },
      });

      // Step D: Create Invoice
      const invoice = await tx.invoice.create({
        data: {
          businessId: business.id,
          saleId: sale.id,
          invoiceNumber,
          issueDate,
          issueTime,
          cashierName,
          customerName,
          customerPhone,
          orderType,
          businessNameEn: business.nameEn,
          businessNameAr: business.nameAr,
          businessAddressEn: business.addressEn,
          businessAddressAr: business.addressAr,
          subtotal,
          discount: discountAmount,
          tax: taxAmount,
          totalAmount,
          paymentMethod,
          status: "ISSUED",
        },
      });

      return {
        sale,
        invoice,
        business: {
          nameEn: business.nameEn,
          nameAr: business.nameAr,
          logoUrl: business.logoUrl,
          phone: business.phone,
          addressEn: business.addressEn,
          addressAr: business.addressAr,
          currency: business.currency,
          receiptFooterEn: business.receiptFooterEn,
          receiptFooterAr: business.receiptFooterAr,
          taxEnabled: business.taxEnabled,
          taxRate: business.taxRate,
          pricingMode: business.pricingMode,
        },
      };
    });

    kdsBroadcaster.broadcast("ORDER_CREATED", {
      saleId: result.sale.id,
      orderNumber: result.sale.orderNumber,
      invoiceNumber: result.invoice.invoiceNumber,
      orderType: result.sale.orderType,
      itemsCount: result.sale.items.length,
      createdAt: result.sale.createdAt,
    });

    return result;
  }

  async listSales(
    limit = 50,
    page = 1,
    filters?: {
      search?: string;
      orderType?: string;
      paymentMethod?: string;
      startDate?: string;
      endDate?: string;
      sortBy?: string;
    }
  ) {
    const take = Math.min(100, Math.max(1, limit));
    const skip = (Math.max(1, page) - 1) * take;

    const where: any = {};
    if (filters?.orderType && filters.orderType !== "ALL") {
      where.orderType = filters.orderType;
    }
    if (filters?.paymentMethod && filters.paymentMethod !== "ALL") {
      where.paymentMethod = filters.paymentMethod;
    }
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerName: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q, mode: "insensitive" } },
        { invoice: { invoiceNumber: { contains: q, mode: "insensitive" } } },
        { user: { name: { contains: q, mode: "insensitive" } } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (filters?.sortBy === "OLDEST") orderBy = { createdAt: "asc" };
    else if (filters?.sortBy === "AMOUNT_DESC") orderBy = { totalAmount: "desc" };
    else if (filters?.sortBy === "AMOUNT_ASC") orderBy = { totalAmount: "asc" };

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        take,
        skip,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
          invoice: true,
          items: {
            include: {
              options: true,
              item: { select: { id: true, nameEn: true, nameAr: true, imageUrl: true } },
            },
          },
        },
        orderBy,
      }),
      prisma.sale.count({ where }),
    ]);

    return { sales, total, page, limit: take };
  }

  async getSale(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        invoice: true,
        items: {
          include: {
            options: true,
            item: {
              select: {
                id: true,
                nameEn: true,
                nameAr: true,
                imageUrl: true,
                sku: true,
                barcode: true,
              },
            },
            variant: {
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
        },
      },
    });

    if (!sale) {
      throw new AppError("SALE_NOT_FOUND", "Sale record not found", 404);
    }

    const business = await businessService.getBusiness();

    return { sale, business };
  }

  async voidSale(
    user: { userId: string; role: string },
    saleId: string,
    voidReason: string,
    restock: boolean = true,
    managerToken?: string
  ) {
    if (!voidReason || !voidReason.trim()) {
      throw new AppError("REASON_REQUIRED", "Void reason is mandatory", 400);
    }

    // Manager authorization check:
    // If the caller is not an ADMIN, a valid, short-lived managerToken signed by the server is required.
    let authorizedByManagerId: string | null = null;
    let authorizedByManagerName: string | null = null;

    if (user.role !== "ADMIN") {
      if (!managerToken) {
        throw new AppError(
          "MANAGER_AUTHORIZATION_REQUIRED",
          "Manager authorization is required to void sales. Please authenticate with Manager PIN.",
          403
        );
      }
      try {
        const decoded = verifyManagerToken(managerToken);
        if (decoded.role !== "ADMIN" || decoded.action !== "MANAGER_OVERRIDE") {
          throw new AppError("INVALID_MANAGER_TOKEN", "Invalid manager authorization token", 403);
        }
        authorizedByManagerId = decoded.managerId;
        authorizedByManagerName = decoded.managerName;
      } catch (err: any) {
        throw new AppError("INVALID_MANAGER_TOKEN", "Manager authorization expired or invalid", 403);
      }
    } else {
      authorizedByManagerId = user.userId;
      authorizedByManagerName = "Admin Self-Authorization";
    }

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            item: { include: { recipes: true } },
            variant: { include: { recipes: true } },
          },
        },
        invoice: true,
      },
    });

    if (!sale) {
      throw new AppError("SALE_NOT_FOUND", "Sale record not found", 404);
    }

    if (sale.status === "VOIDED") {
      throw new AppError("ALREADY_VOIDED", "This sale is already voided", 400);
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update Sale status
      const updatedSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          status: "VOIDED",
          voidReason: voidReason.trim(),
          voidedAt: new Date(),
          voidedByUserId: user.userId,
        },
      });

      // 2. Update Invoice status
      if (sale.invoice) {
        await tx.invoice.update({
          where: { id: sale.invoice.id },
          data: { status: "VOID" },
        });
      }

      // 3. Restock inventory if requested
      if (restock) {
        for (const si of sale.items) {
          if (si.item.stockEnabled) {
            if (si.variant) {
              const updatedVar = await tx.productVariant.update({
                where: { id: si.variant.id },
                data: { stockQuantity: { increment: si.quantity } },
              });

              await tx.stockMovement.create({
                data: {
                  itemId: si.item.id,
                  variantId: si.variant.id,
                  type: "RETURN",
                  quantity: si.quantity,
                  previousStock: updatedVar.stockQuantity - si.quantity,
                  newStock: updatedVar.stockQuantity,
                  referenceId: sale.invoice?.invoiceNumber || sale.id,
                  reason: `Void refund: ${voidReason}`,
                  userId: user.userId,
                },
              });
            } else {
              const updatedItem = await tx.item.update({
                where: { id: si.item.id },
                data: { stockQuantity: { increment: si.quantity } },
              });

              await tx.stockMovement.create({
                data: {
                  itemId: si.item.id,
                  variantId: null,
                  type: "RETURN",
                  quantity: si.quantity,
                  previousStock: updatedItem.stockQuantity - si.quantity,
                  newStock: updatedItem.stockQuantity,
                  referenceId: sale.invoice?.invoiceNumber || sale.id,
                  reason: `Void refund: ${voidReason}`,
                  userId: user.userId,
                },
              });
            }
          }

          // Restock recipe raw ingredients (BOM)
          const recipes = (si.variant as any)?.recipes || (si.item as any)?.recipes || [];
          for (const r of recipes) {
            const returned = r.quantityRequired * si.quantity;
            await tx.ingredient.update({
              where: { id: r.ingredientId },
              data: { currentStock: { increment: returned } },
            }).catch(() => null);
          }
        }
      }

      // 4. Log Audit
      await tx.auditLog.create({
        data: {
          userId: user.userId,
          action: "VOID_ORDER",
          details: JSON.stringify({
            saleId,
            invoiceNumber: sale.invoice?.invoiceNumber,
            totalAmount: sale.totalAmount,
            reason: voidReason,
            authorizedByManagerId,
            authorizedByManagerName,
            restocked: restock,
          }),
        },
      });

      return updatedSale;
    });
  }

  async holdOrder(
    userId: string,
    data: {
      customerName?: string;
      customerPhone?: string;
      tag?: string;
      orderType?: string;
      cartSnapshot: string;
      itemCount: number;
      subtotal: number;
    }
  ) {
    const business = await businessService.getBusiness();

    const shortCode = String(Date.now()).slice(-4);
    const orderNumber = `HLD-${shortCode}`;

    const held = await prisma.heldOrder.create({
      data: {
        businessId: business.id,
        userId,
        customerName: data.customerName?.trim() || null,
        customerPhone: data.customerPhone?.trim() || null,
        tag: data.tag?.trim() || null,
        orderType: data.orderType || "TAKEAWAY",
        orderNumber,
        cartSnapshot: data.cartSnapshot,
        itemCount: data.itemCount || 0,
        subtotal: data.subtotal || 0.0,
      },
    });

    return held;
  }

  async getHeldOrders() {
    const held = await prisma.heldOrder.findMany({
      orderBy: { createdAt: "desc" },
    });
    return held;
  }

  async deleteHeldOrder(id: string) {
    const held = await prisma.heldOrder.delete({
      where: { id },
    });
    return held;
  }
}

export const salesService = new SalesService();