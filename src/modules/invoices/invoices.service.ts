import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/response";

export class InvoicesService {
  async listInvoices(limit = 50, page = 1) {
    const take = Math.min(100, Math.max(1, limit));
    const skip = (Math.max(1, page) - 1) * take;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
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
      prisma.invoice.count(),
    ]);

    return { invoices, total, page, limit: take };
  }

  async getInvoice(id: string) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        OR: [{ id }, { invoiceNumber: id }, { saleId: id }],
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
      throw new AppError("INVOICE_NOT_FOUND", "Invoice not found", 404);
    }

    const business = await prisma.business.findFirst();

    return {
      invoice,
      business,
    };
  }
}

export const invoicesService = new InvoicesService();