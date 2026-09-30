"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kdsService = exports.KdsService = exports.kdsBroadcaster = void 0;
const prisma_1 = require("../../config/prisma");
const response_1 = require("../../utils/response");
// In-memory SSE client pool for real-time order broadcast
class KdsBroadcaster {
    clients = new Set();
    addClient(res) {
        this.clients.add(res);
    }
    removeClient(res) {
        this.clients.delete(res);
    }
    broadcast(event, data) {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        for (const client of this.clients) {
            try {
                client.write(payload);
            }
            catch {
                this.clients.delete(client);
            }
        }
    }
}
exports.kdsBroadcaster = new KdsBroadcaster();
class KdsService {
    async getActiveOrders(station) {
        // Get sales from the last 24 hours that are active for the kitchen/barista
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const sales = await prisma_1.prisma.sale.findMany({
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
    async updateOrderStatus(saleId, status) {
        const existing = await prisma_1.prisma.sale.findUnique({ where: { id: saleId } });
        if (!existing) {
            throw new response_1.AppError("ORDER_NOT_FOUND", "Order record not found", 404);
        }
        const updated = await prisma_1.prisma.sale.update({
            where: { id: saleId },
            data: { status },
            include: { invoice: true },
        });
        exports.kdsBroadcaster.broadcast("ORDER_UPDATED", {
            saleId,
            orderNumber: updated.orderNumber,
            status,
            timestamp: new Date().toISOString(),
        });
        return updated;
    }
}
exports.KdsService = KdsService;
exports.kdsService = new KdsService();
