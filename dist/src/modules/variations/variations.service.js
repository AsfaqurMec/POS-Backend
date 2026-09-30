"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.variationsService = exports.VariationsService = void 0;
const prisma_1 = require("../../config/prisma");
const response_1 = require("../../utils/response");
class VariationsService {
    // === VARIATION GROUPS ===
    async listGroups(itemId) {
        return prisma_1.prisma.variationGroup.findMany({
            where: { itemId },
            include: {
                options: {
                    orderBy: { sortOrder: "asc" },
                },
            },
            orderBy: { sortOrder: "asc" },
        });
    }
    async createGroup(itemId, data) {
        const item = await prisma_1.prisma.item.findUnique({ where: { id: itemId } });
        if (!item)
            throw new response_1.AppError("ITEM_NOT_FOUND", "Item not found", 404);
        return prisma_1.prisma.variationGroup.create({
            data: {
                itemId,
                nameEn: data.nameEn,
                nameAr: data.nameAr,
                required: Boolean(data.required),
                selectionType: data.selectionType || "SINGLE",
                sortOrder: data.sortOrder ? parseInt(data.sortOrder, 10) : 0,
                active: data.active !== undefined ? Boolean(data.active) : true,
            },
            include: { options: true },
        });
    }
    async updateGroup(groupId, data) {
        const group = await prisma_1.prisma.variationGroup.findUnique({ where: { id: groupId } });
        if (!group)
            throw new response_1.AppError("GROUP_NOT_FOUND", "Variation group not found", 404);
        return prisma_1.prisma.variationGroup.update({
            where: { id: groupId },
            data: {
                nameEn: data.nameEn ?? group.nameEn,
                nameAr: data.nameAr ?? group.nameAr,
                required: data.required !== undefined ? Boolean(data.required) : group.required,
                selectionType: data.selectionType ?? group.selectionType,
                sortOrder: data.sortOrder !== undefined ? parseInt(data.sortOrder, 10) : group.sortOrder,
                active: data.active !== undefined ? Boolean(data.active) : group.active,
            },
            include: { options: true },
        });
    }
    async deleteGroup(groupId) {
        await prisma_1.prisma.variationGroup.delete({ where: { id: groupId } });
        return { success: true };
    }
    // === VARIATION OPTIONS ===
    async createOption(groupId, data) {
        const group = await prisma_1.prisma.variationGroup.findUnique({ where: { id: groupId } });
        if (!group)
            throw new response_1.AppError("GROUP_NOT_FOUND", "Variation group not found", 404);
        const priceAdjustment = data.priceAdjustment ? parseFloat(data.priceAdjustment) : 0.0;
        return prisma_1.prisma.variationOption.create({
            data: {
                variationGroupId: groupId,
                nameEn: data.nameEn,
                nameAr: data.nameAr,
                priceAdjustment: isNaN(priceAdjustment) ? 0.0 : priceAdjustment,
                sortOrder: data.sortOrder ? parseInt(data.sortOrder, 10) : 0,
                active: data.active !== undefined ? Boolean(data.active) : true,
            },
        });
    }
    async updateOption(optionId, data) {
        const option = await prisma_1.prisma.variationOption.findUnique({ where: { id: optionId } });
        if (!option)
            throw new response_1.AppError("OPTION_NOT_FOUND", "Option not found", 404);
        let priceAdjustment = option.priceAdjustment;
        if (data.priceAdjustment !== undefined) {
            const parsed = parseFloat(data.priceAdjustment);
            if (!isNaN(parsed))
                priceAdjustment = parsed;
        }
        return prisma_1.prisma.variationOption.update({
            where: { id: optionId },
            data: {
                nameEn: data.nameEn ?? option.nameEn,
                nameAr: data.nameAr ?? option.nameAr,
                priceAdjustment,
                sortOrder: data.sortOrder !== undefined ? parseInt(data.sortOrder, 10) : option.sortOrder,
                active: data.active !== undefined ? Boolean(data.active) : option.active,
            },
        });
    }
    async deleteOption(optionId) {
        await prisma_1.prisma.variationOption.delete({ where: { id: optionId } });
        return { success: true };
    }
    // === PRODUCT VARIANTS (VARIANT MODE) ===
    async listVariants(itemId) {
        return prisma_1.prisma.productVariant.findMany({
            where: { itemId },
            include: {
                variantOptions: {
                    include: {
                        variationGroup: true,
                        variationOption: true,
                    },
                },
            },
            orderBy: { createdAt: "asc" },
        });
    }
    async createVariant(itemId, data) {
        const item = await prisma_1.prisma.item.findUnique({ where: { id: itemId } });
        if (!item)
            throw new response_1.AppError("ITEM_NOT_FOUND", "Item not found", 404);
        const price = data.price !== undefined ? parseFloat(data.price) : item.basePrice;
        const stock = data.stockQuantity !== undefined ? parseInt(data.stockQuantity, 10) : 0;
        return prisma_1.prisma.productVariant.create({
            data: {
                itemId,
                sku: data.sku || null,
                barcode: data.barcode || null,
                price: isNaN(price) ? item.basePrice : price,
                stockQuantity: isNaN(stock) ? 0 : stock,
                active: data.active !== undefined ? Boolean(data.active) : true,
                variantOptions: {
                    create: (data.optionSelections || []).map((sel) => ({
                        variationGroupId: sel.groupId,
                        variationOptionId: sel.optionId,
                    })),
                },
            },
            include: {
                variantOptions: {
                    include: { variationGroup: true, variationOption: true },
                },
            },
        });
    }
    async updateVariant(variantId, data) {
        const variant = await prisma_1.prisma.productVariant.findUnique({ where: { id: variantId } });
        if (!variant)
            throw new response_1.AppError("VARIANT_NOT_FOUND", "Variant not found", 404);
        let price = variant.price;
        if (data.price !== undefined) {
            const parsed = parseFloat(data.price);
            if (!isNaN(parsed) && parsed >= 0)
                price = parsed;
        }
        let stock = variant.stockQuantity;
        if (data.stockQuantity !== undefined) {
            const parsed = parseInt(data.stockQuantity, 10);
            if (!isNaN(parsed))
                stock = parsed;
        }
        return prisma_1.prisma.productVariant.update({
            where: { id: variantId },
            data: {
                sku: data.sku !== undefined ? data.sku : variant.sku,
                barcode: data.barcode !== undefined ? data.barcode : variant.barcode,
                price,
                stockQuantity: stock,
                active: data.active !== undefined ? Boolean(data.active) : variant.active,
            },
            include: {
                variantOptions: {
                    include: { variationGroup: true, variationOption: true },
                },
            },
        });
    }
    async toggleVariantStatus(variantId, active) {
        const variant = await prisma_1.prisma.productVariant.findUnique({ where: { id: variantId } });
        if (!variant)
            throw new response_1.AppError("VARIANT_NOT_FOUND", "Variant not found", 404);
        const newActive = active !== undefined ? active : !variant.active;
        return prisma_1.prisma.productVariant.update({
            where: { id: variantId },
            data: { active: newActive },
        });
    }
    async deleteVariant(variantId) {
        await prisma_1.prisma.productVariant.delete({ where: { id: variantId } });
        return { success: true };
    }
    // === CARTESIAN VARIANT GENERATION (Algorithm Section 19) ===
    async generateVariants(itemId) {
        const item = await prisma_1.prisma.item.findUnique({
            where: { id: itemId },
            include: {
                variationGroups: {
                    where: { active: true },
                    include: {
                        options: { where: { active: true }, orderBy: { sortOrder: "asc" } },
                    },
                    orderBy: { sortOrder: "asc" },
                },
                variants: {
                    include: {
                        variantOptions: true,
                    },
                },
            },
        });
        if (!item)
            throw new response_1.AppError("ITEM_NOT_FOUND", "Item not found", 404);
        if (item.variationGroups.length === 0) {
            throw new response_1.AppError("NO_VARIATION_GROUPS", "Item has no active variation groups", 400);
        }
        // 1. Check that all groups have at least one active option
        for (const g of item.variationGroups) {
            if (g.options.length === 0) {
                throw new response_1.AppError("EMPTY_GROUP", `Variation group "${g.nameEn}" has no active options. Add options first.`, 400);
            }
        }
        // 2. Cartesian Product Generator
        const cartesian = (arrays) => {
            return arrays.reduce((acc, curr) => acc.flatMap((d) => curr.map((e) => [...d, e])), [[]]);
        };
        const groupOptions = item.variationGroups.map((g) => g.options.map((opt) => ({
            groupId: g.id,
            groupNameEn: g.nameEn,
            optionId: opt.id,
            optionNameEn: opt.nameEn,
            priceAdj: opt.priceAdjustment,
        })));
        const combinations = cartesian(groupOptions);
        // 3. Map existing variants to a canonical signature for comparison
        const existingSignatures = new Set(item.variants.map((v) => v.variantOptions
            .map((vo) => vo.variationOptionId)
            .sort()
            .join("-")));
        let createdCount = 0;
        // 4. Create missing combinations only (preserving existing ones!)
        for (const combo of combinations) {
            const comboSignature = combo
                .map((c) => c.optionId)
                .sort()
                .join("-");
            if (!existingSignatures.has(comboSignature)) {
                // Calculate recommended base price adjustment
                const totalAdj = combo.reduce((sum, c) => sum + c.priceAdj, 0);
                const comboPrice = item.basePrice + totalAdj;
                const skuSnippet = combo.map((c) => c.optionNameEn.slice(0, 3).toUpperCase()).join("-");
                const generatedSku = item.sku ? `${item.sku}-${skuSnippet}` : skuSnippet;
                await prisma_1.prisma.productVariant.create({
                    data: {
                        itemId: item.id,
                        sku: generatedSku,
                        price: comboPrice,
                        stockQuantity: 0,
                        active: true,
                        variantOptions: {
                            create: combo.map((c) => ({
                                variationGroupId: c.groupId,
                                variationOptionId: c.optionId,
                            })),
                        },
                    },
                });
                createdCount++;
            }
        }
        // Return the full updated variant list
        return {
            message: `Generated ${createdCount} new variant combinations. Existing variants were preserved.`,
            variants: await this.listVariants(itemId),
        };
    }
}
exports.VariationsService = VariationsService;
exports.variationsService = new VariationsService();
