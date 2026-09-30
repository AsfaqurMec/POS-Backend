import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/response";
import { businessService } from "../business/business.service";

export class ShiftsService {
  async openShift(userId: string, startFloat: number) {
    const existing = await prisma.shift.findFirst({
      where: { userId, status: "OPEN" },
    });

    if (existing) {
      throw new AppError("SHIFT_ALREADY_OPEN", "You already have an active open shift.", 400);
    }

    const business = await businessService.getBusiness();

    const shift = await prisma.shift.create({
      data: {
        businessId: business.id,
        userId,
        startFloat: Math.max(0, startFloat || 0),
        expectedCash: Math.max(0, startFloat || 0),
        status: "OPEN",
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "SHIFT_OPENED",
        details: JSON.stringify({ shiftId: shift.id, startFloat: shift.startFloat }),
      },
    });

    return shift;
  }

  async getCurrentShift(userId: string) {
    const shift = await prisma.shift.findFirst({
      where: { userId, status: "OPEN" },
      orderBy: { openedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        cashMovements: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!shift) {
      return null;
    }

    // Compute live running totals
    const sales = await prisma.sale.findMany({
      where: {
        shiftId: shift.id,
        status: { in: ["COMPLETED", "PREPARING", "READY", "SERVED"] },
      },
    });

    let cashSales = 0;
    let cardSales = 0;
    let otherSales = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalSales = 0;

    for (const sale of sales) {
      totalSales += sale.totalAmount;
      totalDiscount += sale.discountAmount;
      totalTax += sale.taxAmount;

      if (sale.paymentMethod === "CASH") cashSales += sale.totalAmount;
      else if (sale.paymentMethod === "CARD") cardSales += sale.totalAmount;
      else otherSales += sale.totalAmount;
    }

    let paidIns = 0;
    let paidOuts = 0;

    for (const cm of shift.cashMovements) {
      if (cm.type === "PAID_IN") paidIns += cm.amount;
      else if (cm.type === "PAID_OUT" || cm.type === "CASH_DROP") paidOuts += cm.amount;
    }

    const expectedCashInDrawer = shift.startFloat + cashSales + paidIns - paidOuts;

    return {
      shift,
      runningStats: {
        totalOrders: sales.length,
        totalSales,
        cashSales,
        cardSales,
        otherSales,
        totalDiscount,
        totalTax,
        paidIns,
        paidOuts,
        expectedCashInDrawer,
      },
    };
  }

  async addCashMovement(
    userId: string,
    shiftId: string,
    type: "PAID_IN" | "PAID_OUT" | "CASH_DROP",
    amount: number,
    reason: string
  ) {
    if (!amount || amount <= 0) {
      throw new AppError("INVALID_AMOUNT", "Amount must be greater than zero", 400);
    }
    if (!reason || !reason.trim()) {
      throw new AppError("REASON_REQUIRED", "Reason is required for cash movements", 400);
    }

    const shift = await prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift || shift.status !== "OPEN") {
      throw new AppError("INVALID_SHIFT", "Cannot add cash movement to a closed or non-existent shift", 400);
    }

    const movement = await prisma.cashMovement.create({
      data: {
        shiftId,
        userId,
        type,
        amount,
        reason: reason.trim(),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: `CASH_${type}`,
        details: JSON.stringify({ shiftId, amount, reason }),
      },
    });

    return movement;
  }

  async closeShift(userId: string, shiftId: string, actualCash: number, notes?: string) {
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: { cashMovements: true },
    });

    if (!shift || shift.status !== "OPEN") {
      throw new AppError("INVALID_SHIFT", "Shift is already closed or does not exist", 400);
    }

    // Calculate exact totals
    const sales = await prisma.sale.findMany({
      where: { shiftId: shift.id, status: { in: ["COMPLETED", "PREPARING", "READY", "SERVED"] } },
    });

    let cashSales = 0;
    for (const s of sales) {
      if (s.paymentMethod === "CASH") cashSales += s.totalAmount;
    }

    let paidIns = 0;
    let paidOuts = 0;
    for (const cm of shift.cashMovements) {
      if (cm.type === "PAID_IN") paidIns += cm.amount;
      else paidOuts += cm.amount;
    }

    const expectedCash = shift.startFloat + cashSales + paidIns - paidOuts;
    const cashVariance = (actualCash || 0) - expectedCash;

    const closedShift = await prisma.shift.update({
      where: { id: shiftId },
      data: {
        status: "CLOSED",
        closedAt: new Date(),
        actualCash,
        expectedCash,
        cashVariance,
        notes: notes?.trim() || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "SHIFT_CLOSED",
        details: JSON.stringify({
          shiftId,
          actualCash,
          expectedCash,
          cashVariance,
        }),
      },
    });

    const report = await this.getShiftReport(shiftId);
    return { shift: closedShift, report };
  }

  async getShiftReport(shiftId: string) {
    const shift = await prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
        cashMovements: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!shift) {
      throw new AppError("SHIFT_NOT_FOUND", "Shift not found", 404);
    }

    const business = await businessService.getBusiness();

    const sales = await prisma.sale.findMany({
      where: { shiftId: shift.id, status: { in: ["COMPLETED", "PREPARING", "READY", "SERVED"] } },
      include: { invoice: true },
      orderBy: { createdAt: "asc" },
    });

    let cashSales = 0;
    let cardSales = 0;
    let otherSales = 0;
    let subtotal = 0;
    let totalDiscounts = 0;
    let totalTax = 0;
    let totalRevenue = 0;

    for (const sale of sales) {
      subtotal += sale.subtotal;
      totalDiscounts += sale.discountAmount;
      totalTax += sale.taxAmount;
      totalRevenue += sale.totalAmount;

      if (sale.paymentMethod === "CASH") cashSales += sale.totalAmount;
      else if (sale.paymentMethod === "CARD") cardSales += sale.totalAmount;
      else otherSales += sale.totalAmount;
    }

    let paidIns = 0;
    let paidOuts = 0;
    for (const cm of shift.cashMovements) {
      if (cm.type === "PAID_IN") paidIns += cm.amount;
      else paidOuts += cm.amount;
    }

    const expectedCash = shift.startFloat + cashSales + paidIns - paidOuts;
    const actualCash = shift.actualCash ?? expectedCash;
    const cashVariance = shift.cashVariance ?? (actualCash - expectedCash);

    const firstInvoice = sales[0]?.invoice?.invoiceNumber || "N/A";
    const lastInvoice = sales[sales.length - 1]?.invoice?.invoiceNumber || "N/A";

    return {
      business,
      shift: {
        id: shift.id,
        status: shift.status,
        openedAt: shift.openedAt,
        closedAt: shift.closedAt,
        cashierName: shift.user.name,
        cashierRole: shift.user.role,
        startFloat: shift.startFloat,
        expectedCash,
        actualCash,
        cashVariance,
        notes: shift.notes,
      },
      summary: {
        totalOrders: sales.length,
        firstInvoice,
        lastInvoice,
        subtotal,
        totalDiscounts,
        totalTax,
        totalRevenue,
        tenders: {
          cash: cashSales,
          card: cardSales,
          other: otherSales,
        },
        cashReconciliation: {
          startFloat: shift.startFloat,
          cashSales,
          paidIns,
          paidOuts,
          expectedInDrawer: expectedCash,
          actualCounted: actualCash,
          overShort: cashVariance,
        },
      },
      cashMovements: shift.cashMovements,
    };
  }
}

export const shiftsService = new ShiftsService();
