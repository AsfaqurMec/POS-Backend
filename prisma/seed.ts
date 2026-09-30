import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Initialize or get Business
  const business = await prisma.business.upsert({
    where: { id: "default-business-id" },
    update: {},
    create: {
      id: "default-business-id",
      nameEn: "Aroma Specialty Coffee",
      nameAr: "مقهى أروما للقهوة المختصة",
      phone: "+966 50 123 4567",
      addressEn: "Olaya St, Riyadh, Saudi Arabia",
      addressAr: "شارع العليا، الرياض، المملكة العربية السعودية",
      currency: "SAR",
      timezone: "Asia/Riyadh",
      taxEnabled: false,
      taxRate: 0.0,
      pricingMode: "INCLUSIVE",
      invoicePrefix: "INV-",
      receiptFooterEn: "Thank you for visiting Aroma Specialty Coffee! Have a great day.",
      receiptFooterAr: "شكراً لزيارتكم مقهى أروما! نتمنى لكم يوماً رائعاً.",
    },
  });

  // 2. Initialize Invoice Sequence
  const seq = await prisma.invoiceSequence.findFirst();
  if (!seq) {
    await prisma.invoiceSequence.create({
      data: {
        prefix: "INV-",
        currentNumber: 100,
      },
    });
  }

  // 3. Demo Users
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const staffPasswordHash = await bcrypt.hash("staff123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@aromacoffee.com" },
    update: { passwordHash: adminPasswordHash },
    create: {
      name: "Store Manager",
      email: "admin@aromacoffee.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@aromacoffee.com" },
    update: { passwordHash: staffPasswordHash },
    create: {
      name: "Ahmed Barista",
      email: "staff@aromacoffee.com",
      passwordHash: staffPasswordHash,
      role: "STAFF",
      status: "ACTIVE",
    },
  });

  console.log("Created users:", admin.email, staff.email);

  // 4. Categories
  const catHot = await prisma.category.create({
    data: {
      businessId: business.id,
      nameEn: "Hot Coffee",
      nameAr: "قهوة ساخنة",
      descriptionEn: "Freshly brewed espresso & hot coffee beverages",
      descriptionAr: "إسبريسو ومشروبات القهوة الساخنة الطازجة",
      sortOrder: 1,
      active: true,
    },
  });

  const catCold = await prisma.category.create({
    data: {
      businessId: business.id,
      nameEn: "Iced Drinks",
      nameAr: "مشروبات باردة",
      descriptionEn: "Refreshing iced lattes, cold brews & coolers",
      descriptionAr: "مشروبات باردة ومنعشة وآيس لاتيه",
      sortOrder: 2,
      active: true,
    },
  });

  const catBakery = await prisma.category.create({
    data: {
      businessId: business.id,
      nameEn: "Bakery & Sweets",
      nameAr: "مخبوزات وحلويات",
      descriptionEn: "Fresh croissants, muffins & desserts",
      descriptionAr: "كرواسون طازج، مافن وحلويات لذيذة",
      sortOrder: 3,
      active: true,
    },
  });

  const catBeans = await prisma.category.create({
    data: {
      businessId: business.id,
      nameEn: "Specialty Beans",
      nameAr: "حبوب القهوة المختصة",
      descriptionEn: "Packaged premium single-origin & blend beans",
      descriptionAr: "محاصيل وحبوب قهوة مختصة معبأة",
      sortOrder: 4,
      active: true,
    },
  });

  console.log("Created categories");

  // 5. Products:
  // Product A: Cappuccino (OPTION MODE)
  const cappuccino = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catHot.id,
      nameEn: "Cappuccino",
      nameAr: "كابتشينو",
      descriptionEn: "Rich espresso with velvety steamed milk foam",
      descriptionAr: "إسبريسو غني مع رغوة حليب ناعمة ومخملية",
      type: "PRODUCT",
      basePrice: 14.0,
      sku: "HOT-CAP-001",
      barcode: "6281001001",
      stockEnabled: false,
      variationMode: "OPTION",
      active: true,
    },
  });

  // Size Group (Required, Single)
  const capSizeGroup = await prisma.variationGroup.create({
    data: {
      itemId: cappuccino.id,
      nameEn: "Size",
      nameAr: "الحجم",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 1,
      active: true,
      options: {
        create: [
          { nameEn: "Small (8oz)", nameAr: "صغير (8 أونصة)", priceAdjustment: 0.0, sortOrder: 1 },
          { nameEn: "Medium (12oz)", nameAr: "وسط (12 أونصة)", priceAdjustment: 3.0, sortOrder: 2 },
          { nameEn: "Large (16oz)", nameAr: "كبير (16 أونصة)", priceAdjustment: 5.0, sortOrder: 3 },
        ],
      },
    },
  });

  // Milk Group (Required, Single)
  const capMilkGroup = await prisma.variationGroup.create({
    data: {
      itemId: cappuccino.id,
      nameEn: "Milk Choice",
      nameAr: "نوع الحليب",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 2,
      active: true,
      options: {
        create: [
          { nameEn: "Regular Fresh Milk", nameAr: "حليب طازج كامل الدسم", priceAdjustment: 0.0, sortOrder: 1 },
          { nameEn: "Oat Milk", nameAr: "حليب شوفان", priceAdjustment: 4.0, sortOrder: 2 },
          { nameEn: "Almond Milk", nameAr: "حليب لوز", priceAdjustment: 4.0, sortOrder: 3 },
          { nameEn: "Skimmed Milk", nameAr: "حليب قليل الدسم", priceAdjustment: 0.0, sortOrder: 4 },
        ],
      },
    },
  });

  // Extras Group (Optional, Multiple)
  await prisma.variationGroup.create({
    data: {
      itemId: cappuccino.id,
      nameEn: "Extras & Syrups",
      nameAr: "إضافات ونكهات",
      required: false,
      selectionType: "MULTIPLE",
      sortOrder: 3,
      active: true,
      options: {
        create: [
          { nameEn: "Extra Shot Espresso", nameAr: "شوت إسبريسو إضافي", priceAdjustment: 3.0, sortOrder: 1 },
          { nameEn: "Vanilla Syrup", nameAr: "سيرب فانيليا", priceAdjustment: 2.5, sortOrder: 2 },
          { nameEn: "Caramel Drizzle", nameAr: "صوص كراميل", priceAdjustment: 2.0, sortOrder: 3 },
        ],
      },
    },
  });

  // Product B: Iced Spanish Latte (OPTION MODE)
  const spanishLatte = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catCold.id,
      nameEn: "Iced Spanish Latte",
      nameAr: "سبانش لاتيه بارد",
      descriptionEn: "Smooth espresso blended with sweet milk over ice",
      descriptionAr: "إسبريسو ناعم ممزوج بالحليب المكثف المحلى مع الثلج",
      type: "PRODUCT",
      basePrice: 18.0,
      sku: "COLD-SPL-001",
      barcode: "6281001002",
      stockEnabled: false,
      variationMode: "OPTION",
      active: true,
    },
  });

  // Spanish Latte Size
  await prisma.variationGroup.create({
    data: {
      itemId: spanishLatte.id,
      nameEn: "Size",
      nameAr: "الحجم",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 1,
      options: {
        create: [
          { nameEn: "Regular (16oz)", nameAr: "وسط (16 أونصة)", priceAdjustment: 0.0, sortOrder: 1 },
          { nameEn: "Large (20oz)", nameAr: "كبير (20 أونصة)", priceAdjustment: 4.0, sortOrder: 2 },
        ],
      },
    },
  });

  // Spanish Latte Sweetness
  await prisma.variationGroup.create({
    data: {
      itemId: spanishLatte.id,
      nameEn: "Sweetness Level",
      nameAr: "درجة الحلاوة",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 2,
      options: {
        create: [
          { nameEn: "Normal Sweet", nameAr: "حلاوة عادية", priceAdjustment: 0.0, sortOrder: 1 },
          { nameEn: "Less Sweet", nameAr: "حلاوة خفيفة", priceAdjustment: 0.0, sortOrder: 2 },
          { nameEn: "Extra Sweet", nameAr: "حلاوة زيادة", priceAdjustment: 0.0, sortOrder: 3 },
        ],
      },
    },
  });

  // Spanish Latte Ice
  await prisma.variationGroup.create({
    data: {
      itemId: spanishLatte.id,
      nameEn: "Ice Level",
      nameAr: "مستوى الثلج",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 3,
      options: {
        create: [
          { nameEn: "Normal Ice", nameAr: "ثلج عادي", priceAdjustment: 0.0, sortOrder: 1 },
          { nameEn: "Less Ice", nameAr: "ثلج قليل", priceAdjustment: 0.0, sortOrder: 2 },
          { nameEn: "No Ice", nameAr: "بدون ثلج", priceAdjustment: 0.0, sortOrder: 3 },
        ],
      },
    },
  });

  // Product C: Fresh Croissant (NONE MODE - Simple Stock Product)
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catBakery.id,
      nameEn: "Butter Croissant",
      nameAr: "كرواسون زبدة فرنسي",
      descriptionEn: "Golden flaky and buttery French croissant",
      descriptionAr: "كرواسون فرنسي هش ومقرمش غني بالزبدة",
      type: "PRODUCT",
      basePrice: 9.0,
      sku: "BAK-CRS-001",
      barcode: "6281002001",
      stockEnabled: true,
      stockQuantity: 30,
      variationMode: "NONE",
      active: true,
    },
  });

  // Product D: Chocolate Muffin (NONE MODE)
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catBakery.id,
      nameEn: "Double Chocolate Muffin",
      nameAr: "مافن الشوكولاتة المزدوجة",
      descriptionEn: "Moist chocolate muffin with Belgian chocolate chunks",
      descriptionAr: "مافن شوكولاتة طري مع قطع شوكولاتة بلجيكية فاخرة",
      type: "PRODUCT",
      basePrice: 12.0,
      sku: "BAK-MUF-001",
      barcode: "6281002002",
      stockEnabled: true,
      stockQuantity: 20,
      variationMode: "NONE",
      active: true,
    },
  });

  // Product E: Premium Coffee Beans 250g (VARIANT MODE - Real sellable combinations)
  const coffeeBeans = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catBeans.id,
      nameEn: "Aroma House Blend Beans (250g)",
      nameAr: "حبوب قهوة بلند أروما الخاص (250 جرام)",
      descriptionEn: "Artisan roasted 100% Arabica with chocolate & hazelnut notes",
      descriptionAr: "محصول أرابيكا 100% فاخر مع إيحاءات الشوكولاتة والبندق",
      type: "PRODUCT",
      basePrice: 45.0,
      sku: "BEAN-BLD",
      barcode: "6281003000",
      stockEnabled: true,
      stockQuantity: 40,
      variationMode: "VARIANT",
      active: true,
    },
  });

  // Roast Group
  const roastGroup = await prisma.variationGroup.create({
    data: {
      itemId: coffeeBeans.id,
      nameEn: "Roast Level",
      nameAr: "درجة التحميص",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 1,
    },
  });

  const optMedRoast = await prisma.variationOption.create({
    data: {
      variationGroupId: roastGroup.id,
      nameEn: "Medium Roast",
      nameAr: "تحميص متوسط",
      sortOrder: 1,
    },
  });

  const optDarkRoast = await prisma.variationOption.create({
    data: {
      variationGroupId: roastGroup.id,
      nameEn: "Dark Roast",
      nameAr: "تحميص داكن",
      sortOrder: 2,
    },
  });

  // Grind Group
  const grindGroup = await prisma.variationGroup.create({
    data: {
      itemId: coffeeBeans.id,
      nameEn: "Grind Type",
      nameAr: "نوع الطحن",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 2,
    },
  });

  const optWholeBeans = await prisma.variationOption.create({
    data: {
      variationGroupId: grindGroup.id,
      nameEn: "Whole Beans",
      nameAr: "حبوب كاملة غير مطحونة",
      sortOrder: 1,
    },
  });

  const optGround = await prisma.variationOption.create({
    data: {
      variationGroupId: grindGroup.id,
      nameEn: "Espresso Ground",
      nameAr: "مطحونة للإسبريسو",
      sortOrder: 2,
    },
  });

  // Create 4 Real ProductVariant combinations:
  // Variant 1: Medium Roast + Whole Beans
  const var1 = await prisma.productVariant.create({
    data: {
      itemId: coffeeBeans.id,
      sku: "BEAN-MED-WB",
      barcode: "6281003001",
      price: 45.0,
      stockQuantity: 15,
      active: true,
      variantOptions: {
        create: [
          { variationGroupId: roastGroup.id, variationOptionId: optMedRoast.id },
          { variationGroupId: grindGroup.id, variationOptionId: optWholeBeans.id },
        ],
      },
    },
  });

  // Variant 2: Medium Roast + Espresso Ground
  const var2 = await prisma.productVariant.create({
    data: {
      itemId: coffeeBeans.id,
      sku: "BEAN-MED-EG",
      barcode: "6281003002",
      price: 48.0,
      stockQuantity: 10,
      active: true,
      variantOptions: {
        create: [
          { variationGroupId: roastGroup.id, variationOptionId: optMedRoast.id },
          { variationGroupId: grindGroup.id, variationOptionId: optGround.id },
        ],
      },
    },
  });

  // Variant 3: Dark Roast + Whole Beans
  const var3 = await prisma.productVariant.create({
    data: {
      itemId: coffeeBeans.id,
      sku: "BEAN-DRK-WB",
      barcode: "6281003003",
      price: 45.0,
      stockQuantity: 12,
      active: true,
      variantOptions: {
        create: [
          { variationGroupId: roastGroup.id, variationOptionId: optDarkRoast.id },
          { variationGroupId: grindGroup.id, variationOptionId: optWholeBeans.id },
        ],
      },
    },
  });

  // Variant 4: Dark Roast + Espresso Ground
  const var4 = await prisma.productVariant.create({
    data: {
      itemId: coffeeBeans.id,
      sku: "BEAN-DRK-EG",
      barcode: "6281003004",
      price: 48.0,
      stockQuantity: 8,
      active: true,
      variantOptions: {
        create: [
          { variationGroupId: roastGroup.id, variationOptionId: optDarkRoast.id },
          { variationGroupId: grindGroup.id, variationOptionId: optGround.id },
        ],
      },
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });