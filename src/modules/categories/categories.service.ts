import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/response";
import { deleteUploadedFile } from "../../middleware/upload";
import { businessService } from "../business/business.service";

export class CategoriesService {
  async listCategories(includeInactive = false) {
    return prisma.category.findMany({
      where: includeInactive ? {} : { active: true },
      include: {
        _count: {
          select: { items: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  }

  async getCategory(id: string) {
    const category = await prisma.category.findUnique({
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
      throw new AppError("CATEGORY_NOT_FOUND", "Category not found", 404);
    }
    return category;
  }

  async createCategory(data: any, file?: Express.Multer.File) {
    const business = await businessService.getBusiness();
    let imageUrl: string | null = null;
    if (file) {
      imageUrl = `/uploads/categories/${file.filename}`;
    }

    return prisma.category.create({
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

  async updateCategory(id: string, data: any, file?: Express.Multer.File) {
    const current = await prisma.category.findUnique({ where: { id } });
    if (!current) {
      throw new AppError("CATEGORY_NOT_FOUND", "Category not found", 404);
    }

    let imageUrl = current.imageUrl;
    if (file) {
      const newPath = `/uploads/categories/${file.filename}`;
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

    return prisma.category.update({
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

  async toggleStatus(id: string, active?: boolean) {
    const current = await prisma.category.findUnique({ where: { id } });
    if (!current) {
      throw new AppError("CATEGORY_NOT_FOUND", "Category not found", 404);
    }

    const newActive = active !== undefined ? active : !current.active;
    return prisma.category.update({
      where: { id },
      data: { active: newActive },
    });
  }

  async deleteCategory(id: string) {
    const current = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { items: true } } },
    });
    if (!current) {
      throw new AppError("CATEGORY_NOT_FOUND", "Category not found", 404);
    }

    if (current._count.items > 0) {
      throw new AppError("CATEGORY_IN_USE", "Cannot delete category that contains items. Move or delete items first.", 400);
    }

    if (current.imageUrl) {
      deleteUploadedFile(current.imageUrl);
    }

    await prisma.category.delete({ where: { id } });
    return { success: true };
  }
}

export const categoriesService = new CategoriesService();