import { prisma } from "../../config/prisma";

export interface DashboardFilter {
  period?: "today" | "yesterday" | "7days" | "30days" | "this_month" | "last_month" | "this_year" | "custom";
  startDate?: string;
  endDate?: string;
}

export class DashboardService {
  async getDashboardStats(filter: DashboardFilter = {}) {
    const period = filter.period || "7days";
    const now = new Date();

    let startDate: Date;
    let endDate: Date = new Date();
    let prevStartDate: Date;
    let prevEndDate: Date;
    let timeGrouping: "hour" | "day" | "month" = "day";

    switch (period) {
      case "today": {
        timeGrouping = "hour";
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        prevStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        prevEndDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      }
      case "yesterday": {
        timeGrouping = "hour";
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
        prevStartDate = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
        prevEndDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);
        break;
      }
      case "7days": {
        timeGrouping = "day";
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevEndDate = new Date(startDate.getTime());
        break;
      }
      case "30days": {
        timeGrouping = "day";
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        prevStartDate = new Date(startDate.getTime() - 30 * 24 * 60 * 60 * 1000);
        prevEndDate = new Date(startDate.getTime());
        break;
      }
      case "this_month": {
        timeGrouping = "day";
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        const duration = now.getTime() - startDate.getTime();
        prevStartDate = new Date(startDate.getTime() - duration);
        prevEndDate = new Date(startDate.getTime());
        break;
      }
      case "last_month": {
        timeGrouping = "day";
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const duration = endDate.getTime() - startDate.getTime();
        prevStartDate = new Date(startDate.getTime() - duration);
        prevEndDate = new Date(startDate.getTime());
        break;
      }
      case "this_year": {
        timeGrouping = "month";
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        prevStartDate = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0);
        prevEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;
      }
      case "custom": {
        timeGrouping = "day";
        startDate = filter.startDate ? new Date(filter.startDate) : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = filter.endDate ? new Date(filter.endDate) : new Date();
        const duration = Math.max(1, endDate.getTime() - startDate.getTime());
        prevStartDate = new Date(startDate.getTime() - duration);
        prevEndDate = new Date(startDate.getTime());
        if (duration <= 48 * 60 * 60 * 1000) {
          timeGrouping = "hour";
        } else if (duration > 90 * 24 * 60 * 60 * 1000) {
          timeGrouping = "month";
        }
        break;
      }
      default: {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        prevStartDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevEndDate = new Date(startDate.getTime());
      }
    }

    // 1. Fetch current sales in period
    const [currentSales, previousSales] = await Promise.all([
      prisma.sale.findMany({
        where: {
          status: { in: ["COMPLETED", "PREPARING", "READY", "SERVED"] },
          createdAt: { gte: startDate, lte: endDate },
        },
        include: {
          items: {
            include: {
              item: {
                select: {
                  id: true,
                  nameEn: true,
                  nameAr: true,
                  imageUrl: true,
                  categoryId: true,
                  category: { select: { id: true, nameEn: true, nameAr: true } },
                },
              },
            },
          },
          user: { select: { id: true, name: true, email: true, role: true } },
          invoice: { select: { invoiceNumber: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.sale.findMany({
        where: {
          status: { in: ["COMPLETED", "PREPARING", "READY", "SERVED"] },
          createdAt: { gte: prevStartDate, lte: prevEndDate },
        },
        select: { totalAmount: true },
      }),
    ]);

    // 2. Fetch inventory health and catalog assets
    const [itemsList, variantsList] = await Promise.all([
      prisma.item.findMany({
        select: {
          id: true,
          nameEn: true,
          nameAr: true,
          imageUrl: true,
          basePrice: true,
          stockEnabled: true,
          stockQuantity: true,
          variationMode: true,
          category: { select: { id: true, nameEn: true, nameAr: true } },
        },
      }),
      prisma.productVariant.findMany({
        select: {
          id: true,
          itemId: true,
          price: true,
          stockQuantity: true,
          item: {
            select: {
              nameEn: true,
              nameAr: true,
              category: { select: { nameEn: true, nameAr: true } },
            },
          },
        },
      }),
    ]);

    // Total Stock Valuation
    let totalStockValuation = 0;
    let totalUnitsInStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    const criticalStockAlerts: any[] = [];

    for (const item of itemsList) {
      if (item.variationMode !== "VARIANT") {
        if (item.stockEnabled) {
          totalStockValuation += item.stockQuantity * item.basePrice;
          totalUnitsInStock += item.stockQuantity;
          if (item.stockQuantity === 0) {
            outOfStockCount++;
            criticalStockAlerts.push({
              id: item.id,
              nameEn: item.nameEn,
              nameAr: item.nameAr,
              imageUrl: item.imageUrl,
              categoryName: item.category?.nameEn || "General",
              stockQuantity: 0,
              status: "OUT_OF_STOCK",
            });
          } else if (item.stockQuantity <= 5) {
            lowStockCount++;
            criticalStockAlerts.push({
              id: item.id,
              nameEn: item.nameEn,
              nameAr: item.nameAr,
              imageUrl: item.imageUrl,
              categoryName: item.category?.nameEn || "General",
              stockQuantity: item.stockQuantity,
              status: "LOW",
            });
          } else {
            inStockCount++;
          }
        }
      }
    }

    for (const v of variantsList) {
      totalStockValuation += v.stockQuantity * v.price;
      totalUnitsInStock += v.stockQuantity;
      if (v.stockQuantity === 0) {
        outOfStockCount++;
        criticalStockAlerts.push({
          id: v.id,
          nameEn: `${v.item.nameEn} (Variant)`,
          nameAr: `${v.item.nameAr} (متغير)`,
          categoryName: v.item.category?.nameEn || "General",
          stockQuantity: 0,
          status: "OUT_OF_STOCK",
        });
      } else if (v.stockQuantity <= 5) {
        lowStockCount++;
        criticalStockAlerts.push({
          id: v.id,
          nameEn: `${v.item.nameEn} (Variant)`,
          nameAr: `${v.item.nameAr} (متغير)`,
          categoryName: v.item.category?.nameEn || "General",
          stockQuantity: v.stockQuantity,
          status: "LOW",
        });
      } else {
        inStockCount++;
      }
    }

    // 3. Compute Revenue & Orders KPIs
    const totalRevenue = currentSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const prevRevenue = previousSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const revenueGrowth = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : totalRevenue > 0 ? 100 : 0;

    const totalOrders = currentSales.length;
    const prevOrders = previousSales.length;
    const ordersGrowth = prevOrders > 0 ? ((totalOrders - prevOrders) / prevOrders) * 100 : totalOrders > 0 ? 100 : 0;

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalDiscountGiven = currentSales.reduce((sum, s) => sum + s.discountAmount, 0);
    const totalTaxCollected = currentSales.reduce((sum, s) => sum + s.taxAmount, 0);

    let totalUnitsSold = 0;
    for (const sale of currentSales) {
      for (const it of sale.items) {
        totalUnitsSold += it.quantity;
      }
    }

    // Estimated Gross Margin (e.g. 70% for specialty coffee/cafe or based on sales)
    const estimatedGrossProfit = totalRevenue * 0.70;

    // 4. Generate Curves Graph Time Series
    const curvePoints: Record<string, { label: string; revenue: number; orders: number; units: number; timestamp: string }> = {};

    if (timeGrouping === "hour") {
      for (let h = 0; h < 24; h++) {
        const hourStr = String(h).padStart(2, "0") + ":00";
        curvePoints[hourStr] = {
          label: hourStr,
          revenue: 0,
          orders: 0,
          units: 0,
          timestamp: new Date(startDate.getTime() + h * 3600000).toISOString(),
        };
      }
      for (const sale of currentSales) {
        const d = new Date(sale.createdAt);
        const hourKey = String(d.getHours()).padStart(2, "0") + ":00";
        if (curvePoints[hourKey]) {
          curvePoints[hourKey].revenue += sale.totalAmount;
          curvePoints[hourKey].orders += 1;
          for (const it of sale.items) {
            curvePoints[hourKey].units += it.quantity;
          }
        }
      }
    } else if (timeGrouping === "day") {
      const cur = new Date(startDate);
      while (cur <= endDate) {
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, "0");
        const dd = String(cur.getDate()).padStart(2, "0");
        const dayKey = `${yyyy}-${mm}-${dd}`;
        const label = cur.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        curvePoints[dayKey] = {
          label,
          revenue: 0,
          orders: 0,
          units: 0,
          timestamp: cur.toISOString(),
        };
        cur.setDate(cur.getDate() + 1);
      }
      for (const sale of currentSales) {
        const d = new Date(sale.createdAt);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        const dayKey = `${yyyy}-${mm}-${dd}`;
        if (curvePoints[dayKey]) {
          curvePoints[dayKey].revenue += sale.totalAmount;
          curvePoints[dayKey].orders += 1;
          for (const it of sale.items) {
            curvePoints[dayKey].units += it.quantity;
          }
        }
      }
    } else {
      // Month
      for (let m = 0; m < 12; m++) {
        const mDate = new Date(now.getFullYear(), m, 1);
        const label = mDate.toLocaleDateString("en-US", { month: "short" });
        const monthKey = `${now.getFullYear()}-${String(m + 1).padStart(2, "0")}`;
        curvePoints[monthKey] = {
          label,
          revenue: 0,
          orders: 0,
          units: 0,
          timestamp: mDate.toISOString(),
        };
      }
      for (const sale of currentSales) {
        const d = new Date(sale.createdAt);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        if (curvePoints[monthKey]) {
          curvePoints[monthKey].revenue += sale.totalAmount;
          curvePoints[monthKey].orders += 1;
          for (const it of sale.items) {
            curvePoints[monthKey].units += it.quantity;
          }
        }
      }
    }

    const salesCurves = Object.values(curvePoints);

    // 5. Hourly Peak Distribution (00 to 23)
    const hourlyDistribution: { hour: string; count: number; total: number }[] = [];
    for (let h = 0; h < 24; h++) {
      const hStr = `${String(h).padStart(2, "0")}:00`;
      hourlyDistribution.push({ hour: hStr, count: 0, total: 0 });
    }
    for (const s of currentSales) {
      const h = new Date(s.createdAt).getHours();
      if (hourlyDistribution[h]) {
        hourlyDistribution[h].count += 1;
        hourlyDistribution[h].total += s.totalAmount;
      }
    }

    // 6. Payment Method Breakdown
    const paymentMap: Record<string, { method: string; count: number; total: number }> = {};
    for (const s of currentSales) {
      const m = s.paymentMethod || "CASH";
      if (!paymentMap[m]) {
        paymentMap[m] = { method: m, count: 0, total: 0 };
      }
      paymentMap[m].count += 1;
      paymentMap[m].total += s.totalAmount;
    }
    const paymentBreakdown = Object.values(paymentMap).map((p) => ({
      ...p,
      percentage: totalRevenue > 0 ? (p.total / totalRevenue) * 100 : 0,
    }));

    // 7. Order Type Breakdown
    const orderTypeMap: Record<string, { type: string; count: number; total: number }> = {};
    for (const s of currentSales) {
      const t = s.orderType || "TAKEAWAY";
      if (!orderTypeMap[t]) {
        orderTypeMap[t] = { type: t, count: 0, total: 0 };
      }
      orderTypeMap[t].count += 1;
      orderTypeMap[t].total += s.totalAmount;
    }
    const orderTypeBreakdown = Object.values(orderTypeMap).map((ot) => ({
      ...ot,
      percentage: totalOrders > 0 ? (ot.count / totalOrders) * 100 : 0,
    }));

    // 8. Top Best-Selling Products
    const productStatsMap: Record<string, {
      itemId: string;
      nameEn: string;
      nameAr: string;
      imageUrl: string | null;
      categoryNameEn: string;
      categoryNameAr: string;
      unitsSold: number;
      revenue: number;
    }> = {};

    for (const s of currentSales) {
      for (const it of s.items) {
        if (!productStatsMap[it.itemId]) {
          productStatsMap[it.itemId] = {
            itemId: it.itemId,
            nameEn: it.itemNameEnSnapshot || it.item?.nameEn || "Item",
            nameAr: it.itemNameArSnapshot || it.item?.nameAr || "عنصر",
            imageUrl: it.item?.imageUrl || null,
            categoryNameEn: it.item?.category?.nameEn || "General",
            categoryNameAr: it.item?.category?.nameAr || "عام",
            unitsSold: 0,
            revenue: 0,
          };
        }
        productStatsMap[it.itemId].unitsSold += it.quantity;
        productStatsMap[it.itemId].revenue += it.lineTotal;
      }
    }

    const topSellingProducts = Object.values(productStatsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map((p, index) => ({
        rank: index + 1,
        ...p,
        share: totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0,
      }));

    // 9. Category Sales Breakdown
    const categoryStatsMap: Record<string, { id: string; nameEn: string; nameAr: string; revenue: number; unitsSold: number }> = {};
    for (const s of currentSales) {
      for (const it of s.items) {
        const cat = it.item?.category;
        const catId = cat?.id || "other";
        if (!categoryStatsMap[catId]) {
          categoryStatsMap[catId] = {
            id: catId,
            nameEn: cat?.nameEn || "Other",
            nameAr: cat?.nameAr || "أخرى",
            revenue: 0,
            unitsSold: 0,
          };
        }
        categoryStatsMap[catId].revenue += it.lineTotal;
        categoryStatsMap[catId].unitsSold += it.quantity;
      }
    }
    const categoryBreakdown = Object.values(categoryStatsMap)
      .sort((a, b) => b.revenue - a.revenue)
      .map((c) => ({
        ...c,
        percentage: totalRevenue > 0 ? (c.revenue / totalRevenue) * 100 : 0,
      }));

    // 10. Recent Live Feed (latest 6 sales and latest 6 stock movements)
    const recentStockMovements = await prisma.stockMovement.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        item: { select: { id: true, nameEn: true, nameAr: true, imageUrl: true } },
        user: { select: { id: true, name: true, role: true } },
      },
    });

    const recentSales = currentSales.slice(0, 8).map((s) => ({
      id: s.id,
      orderNumber: s.orderNumber || s.invoice?.invoiceNumber?.replace("INV-", "ORD-") || `ORD-${s.id.slice(0, 6).toUpperCase()}`,
      invoiceNumber: s.invoice?.invoiceNumber || "INV",
      customerName: s.customerName || "Walk-in Customer",
      totalAmount: s.totalAmount,
      paymentMethod: s.paymentMethod,
      orderType: s.orderType,
      itemsCount: s.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) || s.items?.length || 0,
      cashierName: s.user?.name || "Staff",
      createdAt: s.createdAt,
    }));

    return {
      period,
      dateRange: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      kpis: {
        totalRevenue,
        revenueGrowth: Number(revenueGrowth.toFixed(1)),
        totalOrders,
        ordersGrowth: Number(ordersGrowth.toFixed(1)),
        averageOrderValue: Number(averageOrderValue.toFixed(2)),
        totalUnitsSold,
        estimatedGrossProfit: Number(estimatedGrossProfit.toFixed(2)),
        totalDiscountGiven,
        totalTaxCollected,
        totalCatalogItems: itemsList.length,
        totalStockValuation: Number(totalStockValuation.toFixed(2)),
        totalUnitsInStock,
        inStockCount,
        lowStockCount,
        outOfStockCount,
      },
      salesCurves,
      hourlyDistribution,
      paymentBreakdown,
      orderTypeBreakdown,
      topSellingProducts,
      categoryBreakdown,
      criticalStockAlerts: criticalStockAlerts.slice(0, 8),
      recentActivity: {
        sales: recentSales,
        stockMovements: recentStockMovements,
      },
    };
  }
}

export const dashboardService = new DashboardService();
