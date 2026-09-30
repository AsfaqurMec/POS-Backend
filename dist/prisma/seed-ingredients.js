"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const business = await prisma.business.findFirst();
    if (!business) {
        console.log("No business found");
        return;
    }
    // 1. Seed standard cafe ingredients
    const ingredientsData = [
        { nameEn: "Espresso Beans (House Blend)", nameAr: "حبوب إسبريسو (خلطة أروما)", unit: "G", costPerUnit: 0.12, currentStock: 15000, reorderLevel: 2500 },
        { nameEn: "Fresh Whole Milk", nameAr: "حليب طازج كامل الدسم", unit: "ML", costPerUnit: 0.007, currentStock: 48000, reorderLevel: 6000 },
        { nameEn: "Barista Oat Milk", nameAr: "حليب شوفان باريستا", unit: "ML", costPerUnit: 0.015, currentStock: 24000, reorderLevel: 4000 },
        { nameEn: "Madagascar Vanilla Syrup", nameAr: "سيروب فانيلا مدغشقر", unit: "ML", costPerUnit: 0.04, currentStock: 5000, reorderLevel: 1000 },
        { nameEn: "Salted Caramel Sauce", nameAr: "صوص كراميل مملح", unit: "ML", costPerUnit: 0.05, currentStock: 4000, reorderLevel: 800 },
        { nameEn: "12oz Paper Cups & Lids", nameAr: "أكواب ورقية 12 أونص وأغطية", unit: "PCS", costPerUnit: 0.45, currentStock: 850, reorderLevel: 200 },
        { nameEn: "16oz Iced Cups & Lids", nameAr: "أكواب بلاستيك 16 أونص وأغطية", unit: "PCS", costPerUnit: 0.55, currentStock: 650, reorderLevel: 150 },
    ];
    for (const ing of ingredientsData) {
        const existing = await prisma.ingredient.findFirst({
            where: { businessId: business.id, nameEn: ing.nameEn },
        });
        if (!existing) {
            await prisma.ingredient.create({
                data: {
                    businessId: business.id,
                    ...ing,
                },
            });
        }
    }
    console.log("Ingredients seeded successfully");
    // 2. Link Recipe to Cappuccino if it exists
    const cappuccino = await prisma.item.findFirst({
        where: { nameEn: { contains: "Cappuccino", mode: "insensitive" } },
    });
    const espressoBeans = await prisma.ingredient.findFirst({
        where: { nameEn: { contains: "Espresso Beans" } },
    });
    const wholeMilk = await prisma.ingredient.findFirst({
        where: { nameEn: { contains: "Whole Milk" } },
    });
    const paperCups = await prisma.ingredient.findFirst({
        where: { nameEn: { contains: "12oz Paper Cups" } },
    });
    if (cappuccino && espressoBeans && wholeMilk && paperCups) {
        await prisma.recipeItem.deleteMany({ where: { itemId: cappuccino.id } });
        await prisma.recipeItem.createMany({
            data: [
                { itemId: cappuccino.id, ingredientId: espressoBeans.id, quantityRequired: 18.0 }, // 18g coffee
                { itemId: cappuccino.id, ingredientId: wholeMilk.id, quantityRequired: 220.0 }, // 220ml milk
                { itemId: cappuccino.id, ingredientId: paperCups.id, quantityRequired: 1.0 }, // 1 cup
            ],
        });
        console.log("Cappuccino recipe linked!");
    }
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
