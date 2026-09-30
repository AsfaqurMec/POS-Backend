import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/response";

// In-memory SSE client pool for real-time order broadcast
class KdsBroadcaster {
  private clients: Set<Response> = new Set();

  addClient(res: Response) {
    this.clients.add(res);
  }

  removeClient(res: Response) {
    this.clients.delete(res);
  }

  broadcast(event: string, data: any) {
    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(payload);
      } catch {
        this.clients.delete(client);
      }
    }
  }
}

export const kdsBroadcaster = new KdsBroadcaster();

export class KdsService {
  async getActiveOrders(station?: string) {
    // Get sales from the last 24 hours that are active for the kitchen/barista
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const sales = await prisma.sale.findMany({
      where: {
        createdAt: { gte: twentyFourHoursAgo },
        status: { in: ["PENDING", "COMPLETED", "PREPARING", "READY"] },
      },
      include: {
        invoice: true,
        user: { select: { name: true } },
        items: {
          include: {
            options: true,
            item: {
              include: { category: true },
            },
            variant: {
              include: {
                variantOptions: {
                  include: { variationGroup: true, variationOption: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Filter by station if specified
    if (station && station !== "ALL") {
      return sales.filter((sale) => {
        return sale.items.some((si) => {
          const catName = si.item?.category?.nameEn?.toLowerCase() || "";
          if (station === "BARISTA") {
            return catName.includes("coffee") || catName.includes("drink") || catName.includes("tea");
          }
          if (station === "KITCHEN") {
            return catName.includes("bakery") || catName.includes("sweets") || catName.includes("food");
          }
          return true;
        });
      });
    }

    return sales;
  }

  async updateOrderStatus(saleId: string, status: string) {
    const existing = await prisma.sale.findUnique({ where: { id: saleId } });
    if (!existing) {
      throw new AppError("ORDER_NOT_FOUND", "Order record not found", 404);
    }

    const updated = await prisma.sale.update({
      where: { id: saleId },
      data: { status },
      include: { invoice: true },
    });

    kdsBroadcaster.broadcast("ORDER_UPDATED", {
      saleId,
      orderNumber: updated.orderNumber,
      status,
      timestamp: new Date().toISOString(),
    });

    return updated;
  }
}

export const kdsService = new KdsService();
