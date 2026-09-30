"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoriesService = exports.CategoriesService = void 0;
const prisma_1 = require("../../config/prisma");
const response_1 = require("../../utils/response");
const upload_1 = require("../../middleware/upload");
const business_service_1 = require("../business/business.service");
class CategoriesService {
    async listCategories(includeInactive = false) {
        return prisma_1.prisma.category.findMany({
            where: includeInactive ? {} : { active: true },
            include: {
                _count: {
                    select: { items: true },
                },
            },
            orderBy: { sortOrder: "asc" },
        });
    }
    async getCategory(id) {
        const category = await prisma_1.prisma.category.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        variants: true,
                        variationGroups: { include: { options: true } },
                    },
                    orderBy: { createdAt: "desc" },
                },
                _count: {
                    select: { items: true },
                },
            },
        });
        if (!category) {
            throw new response_1.AppError("CATEGORY_NOT_FOUND", "Category not found", 404);
        }
        return category;
    }
    async createCategory(data, file) {
        const business = await business_service_1.businessService.getBusiness();
        let imageUrl = null;
        if (file) {
            imageUrl = `/uploads/categories/${file.filename}`;
        }
        return prisma_1.prisma.category.create({
            data: {
                businessId: business.id,
                nameEn: data.nameEn,
                nameAr: data.nameAr,
                descriptionEn: data.descriptionEn || null,
                descriptionAr: data.descriptionAr || null,
                imageUrl,
                sortOrder: data.sortOrder ? parseInt(data.sortOrder, 10) : 0,
                active: data.active !== undefined ? Boolean(data.active === true || data.active === "true") : true,
            },
        });
    }
    async updateCategory(id, data, file) {
        const current = await prisma_1.prisma.category.findUnique({ where: { id } });
        if (!current) {
            throw new response_1.AppError("CATEGORY_NOT_FOUND", "Category not found", 404);
        }
        let imageUrl = current.imageUrl;
        if (file) {
            const newPath = `/uploads/categories/${file.filename}`;
            if (current.imageUrl) {
                (0, upload_1.deleteUploadedFile)(current.imageUrl);
            }
            imageUrl = newPath;
        }
        else if (data.removeImage === true || data.removeImage === "true") {
            if (current.imageUrl) {
                (0, upload_1.deleteUploadedFile)(current.imageUrl);
            }
            imageUrl = null;
        }
        return prisma_1.prisma.category.update({
            where: { id },
            data: {
                nameEn: data.nameEn ?? current.nameEn,
                nameAr: data.nameAr ?? current.nameAr,
                descriptionEn: data.descriptionEn !== undefined ? data.descriptionEn : current.descriptionEn,
                descriptionAr: data.descriptionAr !== undefined ? data.descriptionAr : current.descriptionAr,
                sortOrder: data.sortOrder !== undefined ? parseInt(data.sortOrder, 10) : current.sortOrder,
                active: data.active !== undefined ? Boolean(data.active === true || data.active === "true") : current.active,
                imageUrl,
            },
        });
    }
    async toggleStatus(id, active) {
        const current = await prisma_1.prisma.category.findUnique({ where: { id } });
        if (!current) {
            throw new response_1.AppError("CATEGORY_NOT_FOUND", "Category not found", 404);
        }
        const newActive = active !== undefined ? active : !current.active;
        return prisma_1.prisma.category.update({
            where: { id },
            data: { active: newActive },
        });
    }
    async deleteCategory(id) {
        const current = await prisma_1.prisma.category.findUnique({
            where: { id },
            include: { _count: { select: { items: true } } },
        });
        if (!current) {
            throw new response_1.AppError("CATEGORY_NOT_FOUND", "Category not found", 404);
        }
        if (current._count.items > 0) {
            throw new response_1.AppError("CATEGORY_IN_USE", "Cannot delete category that contains items. Move or delete items first.", 400);
        }
        if (current.imageUrl) {
            (0, upload_1.deleteUploadedFile)(current.imageUrl);
        }
        await prisma_1.prisma.category.delete({ where: { id } });
        return { success: true };
    }
}
exports.CategoriesService = CategoriesService;
exports.categoriesService = new CategoriesService();
