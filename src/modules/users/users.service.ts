import bcrypt from "bcryptjs";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/response";

export class UsersService {
  async listUsers() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        pinCode: true,
        createdAt: true,
        sales: {
          where: { status: { in: ["COMPLETED", "PREPARING", "READY", "SERVED"] } },
          select: { totalAmount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map((u) => {
      const totalSales = u.sales.length;
      const totalRevenue = u.sales.reduce((sum, s) => sum + s.totalAmount, 0);
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        pinCode: u.pinCode,
        createdAt: u.createdAt,
        totalSales,
        totalRevenue,
      };
    });
  }

  async getUser(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        sales: {
          where: { status: { in: ["COMPLETED", "PREPARING", "READY", "SERVED"] } },
          orderBy: { createdAt: "desc" },
          include: {
            invoice: { select: { invoiceNumber: true } },
            _count: { select: { items: true } },
          },
        },
      },
    });

    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    const totalSalesCount = user.sales.length;
    const totalRevenue = user.sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const avgOrderValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;

    // Today's metrics
    const todayStr = new Date().toISOString().split("T")[0];
    const todaySales = user.sales.filter(
      (s) => s.createdAt.toISOString().split("T")[0] === todayStr
    );
    const todaySalesCount = todaySales.length;
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);

    // Order type breakdown
    const orderTypeBreakdown = {
      DINE_IN: user.sales.filter((s) => s.orderType === "DINE_IN").length,
      TAKEAWAY: user.sales.filter((s) => s.orderType === "TAKEAWAY").length,
      DELIVERY: user.sales.filter((s) => s.orderType === "DELIVERY").length,
    };

    // Payment method breakdown
    const paymentMethodBreakdown = user.sales.reduce(
      (acc: Record<string, { count: number; total: number }>, s) => {
        const m = s.paymentMethod || "CASH";
        if (!acc[m]) acc[m] = { count: 0, total: 0 };
        acc[m].count += 1;
        acc[m].total += s.totalAmount;
        return acc;
      },
      {}
    );

    // Recent sales (up to 50)
    const recentSales = user.sales.slice(0, 50).map((s) => ({
      id: s.id,
      orderNumber: (s as any).orderNumber || s.invoice?.invoiceNumber?.replace("INV-", "ORD-") || "ORD-" + s.id.slice(0, 6).toUpperCase(),
      invoiceNumber: s.invoice?.invoiceNumber || "INV-" + s.id.slice(0, 6).toUpperCase(),
      customerName: s.customerName,
      customerPhone: s.customerPhone,
      orderType: s.orderType,
      paymentMethod: s.paymentMethod,
      subtotal: s.subtotal,
      discountAmount: s.discountAmount,
      taxAmount: s.taxAmount,
      totalAmount: s.totalAmount,
      itemsCount: s._count.items,
      createdAt: s.createdAt,
    }));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        totalSalesCount,
        totalRevenue,
        avgOrderValue,
        todaySalesCount,
        todayRevenue,
        orderTypeBreakdown,
        paymentMethodBreakdown,
      },
      recentSales,
    };
  }

  async createUser(data: { name: string; email: string; passwordPlain: string; role?: string }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new AppError("EMAIL_EXISTS", "A user with this email already exists", 400);
    }

    const passwordHash = await bcrypt.hash(data.passwordPlain, 10);
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: data.role === "ADMIN" ? "ADMIN" : "STAFF",
        status: "ACTIVE",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async updateUser(id: string, data: { name?: string; email?: string; passwordPlain?: string; role?: string; status?: string; pinCode?: string | null }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    let passwordHash = user.passwordHash;
    if (data.passwordPlain && data.passwordPlain.trim().length >= 6) {
      passwordHash = await bcrypt.hash(data.passwordPlain.trim(), 10);
    }

    let pinCode = user.pinCode;
    if (data.pinCode !== undefined) {
      if (data.pinCode === null || data.pinCode.trim() === "") {
        pinCode = null;
      } else {
        const cleanPin = data.pinCode.trim();
        if (!/^\d{4,6}$/.test(cleanPin)) {
          throw new AppError("INVALID_PIN", "PIN code must be between 4 and 6 numeric digits", 400);
        }
        pinCode = cleanPin;
      }
    }

    return prisma.user.update({
      where: { id },
      data: {
        name: data.name ?? user.name,
        email: data.email ? data.email.toLowerCase().trim() : user.email,
        passwordHash,
        role: data.role ?? user.role,
        status: data.status ?? user.status,
        pinCode,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        pinCode: true,
        createdAt: true,
      },
    });
  }

  async updateUserPin(id: string, pinCode: string | null) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    let finalPin: string | null = null;
    if (pinCode !== null && pinCode !== undefined && pinCode.trim() !== "") {
      const cleanPin = pinCode.trim();
      if (!/^\d{4,6}$/.test(cleanPin)) {
        throw new AppError("INVALID_PIN", "PIN code must be between 4 and 6 numeric digits", 400);
      }
      finalPin = cleanPin;
    }

    return prisma.user.update({
      where: { id },
      data: { pinCode: finalPin },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        pinCode: true,
      },
    });
  }

  async toggleStatus(id: string, status?: string) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError("USER_NOT_FOUND", "User not found", 404);
    }

    const newStatus = status ? status : user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    return prisma.user.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
  }
}

export const usersService = new UsersService();