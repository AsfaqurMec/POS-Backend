"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invoicesService = exports.InvoicesService = void 0;
const prisma_1 = require("../../config/prisma");
const response_1 = require("../../utils/response");
class InvoicesService {
    async listInvoices(limit = 50, page = 1) {
        const take = Math.min(100, Math.max(1, limit));
        const skip = (Math.max(1, page) - 1) * take;
        const [invoices, total] = await Promise.all([
            prisma_1.prisma.invoice.findMany({
                take,
                skip,
                include: {
                    sale: {
                        include: {
                            user: { select: { id: true, name: true } },
                            items: { include: { options: true } },
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma_1.prisma.invoice.count(),
        ]);
        return { invoices, total, page, limit: take };
    }
    async getInvoice(id) {
        const trimmed = id ? id.trim() : "";
        const invoice = await prisma_1.prisma.invoice.findFirst({
            where: {
                OR: [
                    { id: trimmed },
                    { invoiceNumber: { equals: trimmed, mode: "insensitive" } },
                    { saleId: trimmed },
                ],
            },
            include: {
                sale: {
                    include: {
                        user: { select: { id: true, name: true } },
                        items: {
                            include: { options: true },
                        },
                    },
                },
            },
        });
        if (!invoice) {
            throw new response_1.AppError("INVOICE_NOT_FOUND", "Invoice not found", 404);
        }
        const business = await prisma_1.prisma.business.findFirst();
        return {
            invoice,
            business,
        };
    }
}
exports.InvoicesService = InvoicesService;
exports.invoicesService = new InvoicesService();
