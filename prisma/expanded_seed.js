const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting expanded Coffee Shop POS database seeding on Neon PostgreSQL...");

  // 1. Upsert Business
  const business = await prisma.business.upsert({
    where: { id: "default-business-id" },
    update: {
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
      receiptFooterEn: "Thank you for visiting Aroma Specialty Coffee! Have a wonderful day.",
      receiptFooterAr: "شكراً لزيارتكم مقهى أروما للقهوة المختصة! نتمنى لكم يوماً رائعاً.",
    },
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
      receiptFooterEn: "Thank you for visiting Aroma Specialty Coffee! Have a wonderful day.",
      receiptFooterAr: "شكراً لزيارتكم مقهى أروما للقهوة المختصة! نتمنى لكم يوماً رائعاً.",
    },
  });

  // 2. Invoice Sequence
  const existingSeq = await prisma.invoiceSequence.findFirst();
  if (!existingSeq) {
    await prisma.invoiceSequence.create({
      data: { prefix: "INV-", currentNumber: 100 },
    });
  }

  // 3. Demo Staff & Admin Users
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const staffPasswordHash = await bcrypt.hash("staff123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@aromacoffee.com" },
    update: { passwordHash: adminPasswordHash, role: "ADMIN", status: "ACTIVE" },
    create: {
      name: "Khalid (Store Manager)",
      email: "admin@aromacoffee.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: "staff@aromacoffee.com" },
    update: { passwordHash: staffPasswordHash, role: "STAFF", status: "ACTIVE" },
    create: {
      name: "Ahmed (Head Barista)",
      email: "staff@aromacoffee.com",
      passwordHash: staffPasswordHash,
      role: "STAFF",
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: "sarah@aromacoffee.com" },
    update: { passwordHash: staffPasswordHash, role: "STAFF", status: "ACTIVE" },
    create: {
      name: "Sarah (Barista)",
      email: "sarah@aromacoffee.com",
      passwordHash: staffPasswordHash,
      role: "STAFF",
      status: "ACTIVE",
    },
  });

  console.log("✓ Upserted users: admin@aromacoffee.com, staff@aromacoffee.com, sarah@aromacoffee.com");

  // Clean old category & item data for fresh, pristine state
  console.log("🧹 Clearing old products, variations and categories...");
  await prisma.saleItemOption.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.productVariantOption.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.variationOption.deleteMany({});
  await prisma.variationGroup.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.category.deleteMany({});

  // 4. Create 9 Categories
  console.log("📁 Creating 9 rich categories with exact photos...");
  const categoriesData = [
    {
      key: "hot",
      nameEn: "Hot Coffee",
      nameAr: "قهوة ساخنة",
      descriptionEn: "Classic espresso drinks and velvety steamed milk coffees",
      descriptionAr: "مشروبات الإسبريسو الكلاسيكية والقهوة الساخنة الغنية",
      imageUrl: "/uploads/categories/hot-coffee.jpg",
      sortOrder: 1,
    },
    {
      key: "iced",
      nameEn: "Iced Coffee",
      nameAr: "قهوة باردة ومثلجة",
      descriptionEn: "Chilled espresso, cold brews, and refreshing iced creations",
      descriptionAr: "مشروبات مثلجة، كولد برو وابتكارات قهوة باردة منعشة",
      imageUrl: "/uploads/categories/iced-drinks.jpg",
      sortOrder: 2,
    },
    {
      key: "pourover",
      nameEn: "Pour-Over & Manual Brew",
      nameAr: "قهوة مقطرة وترشيح",
      descriptionEn: "Artisan single-origin coffees extracted via V60 and Chemex",
      descriptionAr: "محاصيل مختصة فردية المصدر تُحضر بأدوات V60 وكيمكس",
      imageUrl: "/uploads/categories/pour-over.jpg",
      sortOrder: 3,
    },
    {
      key: "tea",
      nameEn: "Tea & Matcha",
      nameAr: "شاي وماتشا",
      descriptionEn: "Japanese ceremonial grade matcha and organic loose leaf teas",
      descriptionAr: "ماتشا يابانية احتفالية فاخرة وشاي أوراق طبيعي مختار",
      imageUrl: "/uploads/categories/tea-matcha.jpg",
      sortOrder: 4,
    },
    {
      key: "refreshers",
      nameEn: "Refreshers & Mojitos",
      nameAr: "موهيتو ومشروبات منعشة",
      descriptionEn: "Handcrafted fruit mojitos, artisan lemonades, and iced coolers",
      descriptionAr: "موهيتو فواكه طازجة، ليموناضة ومشروبات صيفية منعشة",
      imageUrl: "/uploads/categories/refreshers.jpg",
      sortOrder: 5,
    },
    {
      key: "sandwiches",
      nameEn: "Artisan Sandwiches",
      nameAr: "ساندوتشات وفطائر",
      descriptionEn: "Gourmet freshly baked focaccias, paninis, and croissants",
      descriptionAr: "ساندوتشات فوكاشيا مخبوزة طازجة، بانيني وكرواسون بحشوات مميزة",
      imageUrl: "/uploads/categories/sandwiches.jpg",
      sortOrder: 6,
    },
    {
      key: "bakery",
      nameEn: "Bakery & Croissants",
      nameAr: "مخبوزات وكرواسون",
      descriptionEn: "Fresh French butter croissants, danishes, and buns",
      descriptionAr: "كرواسون فرنسي بالزبدة الفاخرة ولفائف مخبوزة يومياً",
      imageUrl: "/uploads/categories/bakery.jpg",
      sortOrder: 7,
    },
    {
      key: "desserts",
      nameEn: "Cakes & Desserts",
      nameAr: "كيك وحلويات",
      descriptionEn: "Artisan Basque cheesecakes, authentic tiramisu, and cakes",
      descriptionAr: "تشيز كيك سان سيباستيان، تيراميسو وكيك شوكولاتة فاخر",
      imageUrl: "/uploads/categories/desserts.jpg",
      sortOrder: 8,
    },
    {
      key: "beans",
      nameEn: "Specialty Coffee Beans",
      nameAr: "حبوب قهوة مختصة",
      descriptionEn: "Freshly roasted specialty whole bean & custom ground coffee bags",
      descriptionAr: "أكياس حبوب قهوة مختصة محمصة طازجة بمختلف الأوزان والطحن",
      imageUrl: "/uploads/categories/beans.jpg",
      sortOrder: 9,
    },
  ];

  const catMap = {};
  for (const c of categoriesData) {
    const created = await prisma.category.create({
      data: {
        businessId: business.id,
        nameEn: c.nameEn,
        nameAr: c.nameAr,
        descriptionEn: c.descriptionEn,
        descriptionAr: c.descriptionAr,
        imageUrl: c.imageUrl,
        sortOrder: c.sortOrder,
        active: true,
      },
    });
    catMap[c.key] = created;
  }
  console.log("✓ Created 9 categories successfully.");

  // Helper for Option groups
  async function addOptionGroups(itemId, groups) {
    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
      const g = groups[gIdx];
      const createdGroup = await prisma.variationGroup.create({
        data: {
          itemId,
          nameEn: g.nameEn,
          nameAr: g.nameAr,
          required: g.required,
          selectionType: g.selectionType,
          sortOrder: gIdx + 1,
          active: true,
        },
      });

      for (let oIdx = 0; oIdx < g.options.length; oIdx++) {
        const o = g.options[oIdx];
        await prisma.variationOption.create({
          data: {
            variationGroupId: createdGroup.id,
            nameEn: o.nameEn,
            nameAr: o.nameAr,
            priceAdjustment: o.priceAdjustment || 0.0,
            sortOrder: oIdx + 1,
            active: true,
          },
        });
      }
    }
  }

  // 5. Seed Products
  console.log("☕ Seeding 38 realistic products with exact images and variations...");

  // --- Category 1: Hot Coffee ---
  // 1. Cappuccino
  const pCappuccino = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.hot.id,
      nameEn: "Cappuccino",
      nameAr: "كابتشينو",
      descriptionEn: "Equal parts espresso, steamed milk, and velvety thick foam",
      descriptionAr: "إسبريسو مركز مع حليب مبخر ورغوة حليب كريمية غنية",
      imageUrl: "/uploads/products/cappuccino.jpg",
      basePrice: 16.0,
      sku: "HOT-CAP-01",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pCappuccino.id, [
    {
      nameEn: "Cup Size",
      nameAr: "الحجم",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Regular (8 oz)", nameAr: "عادي (8 أونصة)", priceAdjustment: 0.0 },
        { nameEn: "Large (12 oz)", nameAr: "كبير (12 أونصة)", priceAdjustment: 3.0 },
      ],
    },
    {
      nameEn: "Milk Choice",
      nameAr: "نوع الحليب",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Whole Milk", nameAr: "حليب كامل الدسم", priceAdjustment: 0.0 },
        { nameEn: "Oat Milk (Barista)", nameAr: "حليب شوفان باريستا", priceAdjustment: 4.0 },
        { nameEn: "Almond Milk", nameAr: "حليب لوز", priceAdjustment: 4.0 },
        { nameEn: "Skimmed Milk", nameAr: "حليب قليل الدسم", priceAdjustment: 0.0 },
      ],
    },
    {
      nameEn: "Extra Add-ons",
      nameAr: "إضافات مميزة",
      required: false,
      selectionType: "MULTIPLE",
      options: [
        { nameEn: "Extra Espresso Shot", nameAr: "شوت إسبريسو إضافي", priceAdjustment: 4.0 },
        { nameEn: "Vanilla Syrup", nameAr: "سيروب فانيلا", priceAdjustment: 3.0 },
        { nameEn: "Caramel Drizzle", nameAr: "رشة كراميل", priceAdjustment: 2.0 },
      ],
    },
  ]);

  // 2. Spanish Latte
  const pSpanishLatte = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.hot.id,
      nameEn: "Hot Spanish Latte",
      nameAr: "سبانش لاتيه ساخن",
      descriptionEn: "Smooth espresso blended with sweet condensed milk and steamed milk",
      descriptionAr: "إسبريسو سلس ممزوج بالحليب المكثف المحلى والحليب المبخر",
      imageUrl: "/uploads/products/spanish-latte.jpg",
      basePrice: 18.0,
      sku: "HOT-SPL-02",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pSpanishLatte.id, [
    {
      nameEn: "Size",
      nameAr: "الحجم",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Regular (12 oz)", nameAr: "وسط (12 أونصة)", priceAdjustment: 0.0 },
        { nameEn: "Large (16 oz)", nameAr: "كبير (16 أونصة)", priceAdjustment: 4.0 },
      ],
    },
    {
      nameEn: "Sweetness",
      nameAr: "درجة الحلاوة",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Regular Sweet", nameAr: "حلاوة عادية", priceAdjustment: 0.0 },
        { nameEn: "Half Sweet", nameAr: "نصف حلاوة", priceAdjustment: 0.0 },
        { nameEn: "Extra Sweet", nameAr: "حلاوة زيادة", priceAdjustment: 0.0 },
      ],
    },
    {
      nameEn: "Milk Choice",
      nameAr: "نوع الحليب",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Fresh Dairy Milk", nameAr: "حليب طازج", priceAdjustment: 0.0 },
        { nameEn: "Oat Milk", nameAr: "حليب شوفان", priceAdjustment: 4.0 },
      ],
    },
  ]);

  // 3. Flat White
  const pFlatWhite = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.hot.id,
      nameEn: "Flat White",
      nameAr: "فلات وايت",
      descriptionEn: "Double ristretto shot topped with silky, micro-foamed milk",
      descriptionAr: "دبل ريستريتو إسبريسو مع طبقة ناعمة من الحليب المبخر المخملي",
      imageUrl: "/uploads/products/flat-white.jpg",
      basePrice: 16.0,
      sku: "HOT-FLW-03",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pFlatWhite.id, [
    {
      nameEn: "Milk",
      nameAr: "نوع الحليب",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Whole Milk", nameAr: "حليب كامل الدسم", priceAdjustment: 0.0 },
        { nameEn: "Oat Milk", nameAr: "حليب شوفان", priceAdjustment: 4.0 },
      ],
    },
    {
      nameEn: "Coffee Origin",
      nameAr: "نوع البن",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "House Blend", nameAr: "بلند أروما الخاص", priceAdjustment: 0.0 },
        { nameEn: "Ethiopia Single Origin", nameAr: "محصول إثيوبيا المختص", priceAdjustment: 3.0 },
      ],
    },
  ]);

  // 4. Americano
  const pAmericano = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.hot.id,
      nameEn: "Caffè Americano",
      nameAr: "أمريكانو كلاسيك",
      descriptionEn: "Bold double espresso poured over hot water for a crisp, clean cup",
      descriptionAr: "دبل إسبريسو مع ماء ساخن لمذاق قهوة صافٍ وقوي",
      imageUrl: "/uploads/products/americano.jpg",
      basePrice: 13.0,
      sku: "HOT-AMR-04",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pAmericano.id, [
    {
      nameEn: "Size",
      nameAr: "الحجم",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Regular (12 oz)", nameAr: "عادي (12 أونصة)", priceAdjustment: 0.0 },
        { nameEn: "Large (16 oz)", nameAr: "كبير (16 أونصة)", priceAdjustment: 3.0 },
      ],
    },
    {
      nameEn: "Strength",
      nameAr: "التركيز",
      required: false,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Standard (Double Shot)", nameAr: "دبل شوت قياسي", priceAdjustment: 0.0 },
        { nameEn: "Triple Shot (+1)", nameAr: "تريبل شوت (+1)", priceAdjustment: 4.0 },
      ],
    },
  ]);

  // 5. Caramel Macchiato
  const pMacchiato = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.hot.id,
      nameEn: "Caramel Macchiato",
      nameAr: "كراميل ماكياتو ساخن",
      descriptionEn: "Vanilla-infused steamed milk marked with rich espresso and caramel",
      descriptionAr: "حليب مبخر بالفانيلا مع شوت إسبريسو وصوص الكراميل اللذيذ",
      imageUrl: "/uploads/products/caramel-macchiato.jpg",
      basePrice: 19.0,
      sku: "HOT-MAC-05",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pMacchiato.id, [
    {
      nameEn: "Size",
      nameAr: "الحجم",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Regular (12 oz)", nameAr: "عادي", priceAdjustment: 0.0 },
        { nameEn: "Large (16 oz)", nameAr: "كبير", priceAdjustment: 4.0 },
      ],
    },
    {
      nameEn: "Milk",
      nameAr: "الحليب",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Whole Milk", nameAr: "حليب كامل الدسم", priceAdjustment: 0.0 },
        { nameEn: "Oat Milk", nameAr: "حليب شوفان", priceAdjustment: 4.0 },
      ],
    },
  ]);

  // 6. Cortado
  const pCortado = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.hot.id,
      nameEn: "Cortado",
      nameAr: "كورتادو إسباني",
      descriptionEn: "Equal parts espresso and textured warm milk in a 4.5 oz Gibraltar glass",
      descriptionAr: "نسبة متساوية من الإسبريسو والحليب المبخر بقوام متوازن جداً",
      imageUrl: "/uploads/products/cortado.jpg",
      basePrice: 15.0,
      sku: "HOT-COR-06",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pCortado.id, [
    {
      nameEn: "Milk",
      nameAr: "نوع الحليب",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Whole Dairy Milk", nameAr: "حليب طازج", priceAdjustment: 0.0 },
        { nameEn: "Oat Milk", nameAr: "حليب شوفان", priceAdjustment: 3.0 },
      ],
    },
  ]);

  // 7. Mocha
  const pMocha = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.hot.id,
      nameEn: "Hot Caffè Mocha",
      nameAr: "موكا ساخنة بالكاكاو الفاخر",
      descriptionEn: "Rich dark chocolate ganache combined with espresso and steamed milk",
      descriptionAr: "شوكولاتة داكنة ذائبة مع إسبريسو غني وحليب مبخر",
      imageUrl: "/uploads/products/mocha.jpg",
      basePrice: 18.0,
      sku: "HOT-MOC-07",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pMocha.id, [
    {
      nameEn: "Size",
      nameAr: "الحجم",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Regular (12 oz)", nameAr: "وسط", priceAdjustment: 0.0 },
        { nameEn: "Large (16 oz)", nameAr: "كبير", priceAdjustment: 4.0 },
      ],
    },
    {
      nameEn: "Whipped Cream",
      nameAr: "كريمة مخفوقة",
      required: false,
      selectionType: "SINGLE",
      options: [
        { nameEn: "With Whipped Cream", nameAr: "مع كريمة مخفوقة", priceAdjustment: 2.0 },
      ],
    },
  ]);

  // --- Category 2: Iced Coffee ---
  // 8. Iced Spanish Latte
  const pIcedSpanish = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.iced.id,
      nameEn: "Iced Spanish Latte",
      nameAr: "آيس سبانش لاتيه",
      descriptionEn: "Our bestselling chilled sweetened latte served over crystalline ice cubes",
      descriptionAr: "المشروب الأكثر طلباً: لاتيه مثلج ممزوج بالحليب المكثف وحبوب الإسبريسو",
      imageUrl: "/uploads/products/iced-spanish-latte.jpg",
      basePrice: 19.0,
      sku: "ICE-SPL-08",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pIcedSpanish.id, [
    {
      nameEn: "Size",
      nameAr: "الحجم",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Regular (16 oz)", nameAr: "وسط (16 أونصة)", priceAdjustment: 0.0 },
        { nameEn: "Large (20 oz)", nameAr: "كبير (20 أونصة)", priceAdjustment: 4.0 },
      ],
    },
    {
      nameEn: "Sweetness",
      nameAr: "درجة السكر",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Regular Sweet", nameAr: "حلاوة عادية", priceAdjustment: 0.0 },
        { nameEn: "Half Sweet", nameAr: "نصف حلاوة", priceAdjustment: 0.0 },
      ],
    },
    {
      nameEn: "Milk Choice",
      nameAr: "نوع الحليب",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Dairy Milk", nameAr: "حليب طازج", priceAdjustment: 0.0 },
        { nameEn: "Oat Milk", nameAr: "حليب شوفان", priceAdjustment: 4.0 },
      ],
    },
  ]);

  // 9. Iced Salted Caramel Latte
  const pIcedSalted = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.iced.id,
      nameEn: "Iced Salted Caramel Latte",
      nameAr: "آيس كراميل مملح",
      descriptionEn: "Espresso, cold milk, salted butter caramel sauce, topped with creamy cold foam",
      descriptionAr: "إسبريسو مثلج مع صوص الكراميل المملح وفوم كريمي بارد وناعم",
      imageUrl: "/uploads/products/iced-salted-caramel.jpg",
      basePrice: 21.0,
      sku: "ICE-SCL-09",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pIcedSalted.id, [
    {
      nameEn: "Size",
      nameAr: "الحجم",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Regular (16 oz)", nameAr: "وسط", priceAdjustment: 0.0 },
        { nameEn: "Large (20 oz)", nameAr: "كبير", priceAdjustment: 4.0 },
      ],
    },
    {
      nameEn: "Cold Foam Topping",
      nameAr: "رغوة باردة (كولد فوم)",
      required: false,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Salted Caramel Cold Foam", nameAr: "فوم كراميل مملح", priceAdjustment: 4.0 },
        { nameEn: "Vanilla Sweet Foam", nameAr: "فوم فانيلا حلو", priceAdjustment: 3.0 },
      ],
    },
  ]);

  // 10. Iced Americano
  const pIcedAmericano = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.iced.id,
      nameEn: "Iced Americano",
      nameAr: "آيس أمريكانو",
      descriptionEn: "Chilled double espresso poured over cold filtered water and ice",
      descriptionAr: "دبل إسبريسو مثلج مع ماء نقي بارد لإنعاش كامل",
      imageUrl: "/uploads/products/iced-americano.jpg",
      basePrice: 14.0,
      sku: "ICE-AMR-10",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pIcedAmericano.id, [
    {
      nameEn: "Size",
      nameAr: "الحجم",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Regular (16 oz)", nameAr: "وسط", priceAdjustment: 0.0 },
        { nameEn: "Large (20 oz)", nameAr: "كبير", priceAdjustment: 3.0 },
      ],
    },
    {
      nameEn: "Extra Shot",
      nameAr: "شوت إضافي",
      required: false,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Add Extra Espresso Shot", nameAr: "إضافة شوت إسبريسو", priceAdjustment: 4.0 },
      ],
    },
  ]);

  // 11. Cold Brew
  const pColdBrew = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.iced.id,
      nameEn: "Signature 18-Hour Cold Brew",
      nameAr: "كولد برو منقوع 18 ساعة",
      descriptionEn: "Single-origin beans steeped in chilled water for 18 hours. Ultra smooth and naturally sweet",
      descriptionAr: "محصول مختص منقوع بالماء البارد 18 ساعة لقوام فائق النعومة وخالٍ من المرارة",
      imageUrl: "/uploads/products/cold-brew.jpg",
      basePrice: 20.0,
      sku: "ICE-CBR-11",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pColdBrew.id, [
    {
      nameEn: "Style",
      nameAr: "طريقة التقديم",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Classic Black", nameAr: "أسود كلاسيكي", priceAdjustment: 0.0 },
        { nameEn: "Sweet Vanilla Cream Float", nameAr: "مع طبقة كريمة الفانيلا", priceAdjustment: 3.0 },
      ],
    },
  ]);

  // 12. Iced White Chocolate Mocha
  const pIcedWhiteMocha = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.iced.id,
      nameEn: "Iced White Chocolate Mocha",
      nameAr: "آيس وايت شوكليت موكا",
      descriptionEn: "White chocolate sauce, espresso, cold milk and whipped cream over ice",
      descriptionAr: "شوكولاتة بيضاء غنية مع إسبريسو وحليب مثلج وكريمة",
      imageUrl: "/uploads/products/iced-white-mocha.jpg",
      basePrice: 20.0,
      sku: "ICE-WMC-12",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pIcedWhiteMocha.id, [
    {
      nameEn: "Size",
      nameAr: "الحجم",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Regular (16 oz)", nameAr: "وسط", priceAdjustment: 0.0 },
        { nameEn: "Large (20 oz)", nameAr: "كبير", priceAdjustment: 4.0 },
      ],
    },
  ]);

  // 13. Shaken Espresso
  const pShakenEspresso = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.iced.id,
      nameEn: "Brown Sugar Shaken Espresso",
      nameAr: "شيكن إسبريسو بالسكر البني والشوفان",
      descriptionEn: "Blonde espresso vigorously hand-shaken with brown sugar, cinnamon, topped with oat milk",
      descriptionAr: "إسبريسو مخفوق يدوياً مع الثلج والسكر البني والقرفة ومغطى بحليب الشوفان",
      imageUrl: "/uploads/products/shaken-espresso.jpg",
      basePrice: 19.0,
      sku: "ICE-SHK-13",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pShakenEspresso.id, [
    {
      nameEn: "Flavor Note",
      nameAr: "النكهة",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Brown Sugar & Cinnamon", nameAr: "سكر بني وقرفة", priceAdjustment: 0.0 },
        { nameEn: "Toasted Hazelnut", nameAr: "بندق محمص", priceAdjustment: 0.0 },
      ],
    },
  ]);

  // --- Category 3: Pour-Over & Manual Brew ---
  // 14. V60 Ethiopia
  const pV60Eth = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.pourover.id,
      nameEn: "V60 Ethiopia Yirgacheffe",
      nameAr: "V60 إثيوبيا يرجاشيفي المختصة",
      descriptionEn: "Floral jasmine aroma with bergamot, lemon zest, and peach notes",
      descriptionAr: "إيحاءات الياسمين، الخوخ والحمضيات المنعشة بقوام ناعم ومشرق",
      imageUrl: "/uploads/products/v60-ethiopia.jpg",
      basePrice: 22.0,
      sku: "PO-ETH-14",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pV60Eth.id, [
    {
      nameEn: "Serving Temp",
      nameAr: "درجة التقديم",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Hot Pour-Over", nameAr: "حار ترشيح يدوي", priceAdjustment: 0.0 },
        { nameEn: "Iced V60 (Over Ice)", nameAr: "مثلج (على ثلج صخري)", priceAdjustment: 2.0 },
      ],
    },
  ]);

  // 15. V60 Colombia
  const pV60Col = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.pourover.id,
      nameEn: "V60 Colombia Huila",
      nameAr: "V60 كولومبيا هويلا",
      descriptionEn: "Rich caramel sweetness, red berries, and balanced cocoa finish",
      descriptionAr: "حلاوة الكراميل الواضحة، التوت الأحمر ونهاية كاكاو متوازنة",
      imageUrl: "/uploads/products/v60-colombia.jpg",
      basePrice: 21.0,
      sku: "PO-COL-15",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pV60Col.id, [
    {
      nameEn: "Serving Temp",
      nameAr: "درجة التقديم",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Hot Pour-Over", nameAr: "حار", priceAdjustment: 0.0 },
        { nameEn: "Iced V60", nameAr: "مثلج", priceAdjustment: 2.0 },
      ],
    },
  ]);

  // 16. Chemex
  const pChemex = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.pourover.id,
      nameEn: "Chemex Pour-Over (500ml)",
      nameAr: "كيمكس ترشيح (500 مل مشاركة)",
      descriptionEn: "Slow, triple-filtered extraction delivering an impeccably clean and vibrant cup",
      descriptionAr: "استخلاص نقي جداً بفلتر كيمكس السميك لمذاق غاية في الصفاء",
      imageUrl: "/uploads/products/chemex.jpg",
      basePrice: 32.0,
      sku: "PO-CHX-16",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pChemex.id, [
    {
      nameEn: "Bean Selection",
      nameAr: "اختيار المحصول",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Ethiopian Floral", nameAr: "إثيوبي زهري", priceAdjustment: 0.0 },
        { nameEn: "Colombian Fruity", nameAr: "كولومبي فاكهي", priceAdjustment: 0.0 },
        { nameEn: "Panama Geisha (+10 SAR)", nameAr: "بنما جيشا فاخر (+10 ر.س)", priceAdjustment: 10.0 },
      ],
    },
  ]);

  // --- Category 4: Tea & Matcha ---
  // 17. Ceremonial Iced Matcha Latte
  const pMatchaIced = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.tea.id,
      nameEn: "Iced Ceremonial Matcha Latte",
      nameAr: "آيس ماتشا لاتيه احتفالية",
      descriptionEn: "First-harvest Uji ceremonial matcha whisked with fresh milk and served over ice",
      descriptionAr: "ماتشا احتفالية يابانية فاخرة مخفوقة يدوياً مع الحليب والثلج",
      imageUrl: "/uploads/products/matcha-iced.jpg",
      basePrice: 22.0,
      sku: "TEA-MAT-17",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pMatchaIced.id, [
    {
      nameEn: "Milk Choice",
      nameAr: "نوع الحليب",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Oat Milk (Barista)", nameAr: "حليب شوفان باريستا", priceAdjustment: 0.0 },
        { nameEn: "Coconut Milk", nameAr: "حليب جوز هند", priceAdjustment: 2.0 },
        { nameEn: "Fresh Dairy Milk", nameAr: "حليب طازج", priceAdjustment: 0.0 },
      ],
    },
    {
      nameEn: "Sweetener",
      nameAr: "التحلية",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Unsweetened (Pure Matcha)", nameAr: "بدون سكر (ماتشا صافية)", priceAdjustment: 0.0 },
        { nameEn: "Pure Honey", nameAr: "عسل طبيعي", priceAdjustment: 2.0 },
        { nameEn: "Madagascar Vanilla", nameAr: "فانيلا طبيعية", priceAdjustment: 2.0 },
      ],
    },
  ]);

  // 18. Warm Matcha
  const pMatchaHot = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.tea.id,
      nameEn: "Warm Ceremonial Matcha Latte",
      nameAr: "ماتشا لاتيه دافئة احتفالية",
      descriptionEn: "Whisked ceremonial matcha with micro-foamed steamed milk",
      descriptionAr: "ماتشا يابانية دافئة مخفوقة مع حليب مبخر مخملي",
      imageUrl: "/uploads/products/matcha-hot.jpg",
      basePrice: 21.0,
      sku: "TEA-MAT-18",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pMatchaHot.id, [
    {
      nameEn: "Milk",
      nameAr: "نوع الحليب",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Oat Milk", nameAr: "حليب شوفان", priceAdjustment: 0.0 },
        { nameEn: "Whole Milk", nameAr: "حليب كامل الدسم", priceAdjustment: 0.0 },
      ],
    },
  ]);

  // 19. Earl Grey
  const pEarlGrey = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.tea.id,
      nameEn: "Imperial Earl Grey Tea",
      nameAr: "شاي إيرل جراي بريطاني فاخر",
      descriptionEn: "Whole leaf black tea scented with cold-pressed Italian bergamot oil",
      descriptionAr: "أوراق شاي أسود فاخرة مع زيت البرغموت الإيطالي الطبيعي",
      imageUrl: "/uploads/products/earl-grey.jpg",
      basePrice: 12.0,
      sku: "TEA-EGY-19",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pEarlGrey.id, [
    {
      nameEn: "Additions",
      nameAr: "إضافات",
      required: false,
      selectionType: "MULTIPLE",
      options: [
        { nameEn: "Fresh Mint Leaves", nameAr: "أوراق نعناع طازجة", priceAdjustment: 0.0 },
        { nameEn: "Lemon Slice", nameAr: "شريحة ليمون", priceAdjustment: 0.0 },
        { nameEn: "Natural Honey Spoon", nameAr: "ملعقة عسل سدر", priceAdjustment: 2.0 },
      ],
    },
  ]);

  // 20. Moroccan Mint Tea
  const pMoroccan = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.tea.id,
      nameEn: "Moroccan Fresh Mint Tea",
      nameAr: "شاي مغربي أصيل بالنعناع الطازج",
      descriptionEn: "Steeped gunpowder green tea infused with abundant fresh spearmint leaves",
      descriptionAr: "شاي أخضر صيني مع أوراق النعناع الطازجة المحضر على الطريقة المغربية",
      imageUrl: "/uploads/products/moroccan-mint.jpg",
      basePrice: 14.0,
      sku: "TEA-MOR-20",
      stockEnabled: false,
      variationMode: "OPTION",
    },
  });
  await addOptionGroups(pMoroccan.id, [
    {
      nameEn: "Sweetness",
      nameAr: "السكر",
      required: true,
      selectionType: "SINGLE",
      options: [
        { nameEn: "Medium Sweet", nameAr: "حلاوة معتدلة", priceAdjustment: 0.0 },
        { nameEn: "Without Sugar", nameAr: "بدون سكر", priceAdjustment: 0.0 },
      ],
    },
  ]);

  // --- Category 5: Refreshers & Mojitos (NONE Mode) ---
  // 21. Passionfruit Mojito
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.refreshers.id,
      nameEn: "Passionfruit Mint Mojito",
      nameAr: "موهيتو الباشن فروت المنعش",
      descriptionEn: "Tangy tropical passionfruit pulp, fresh crushed mint, lime, and sparkling soda",
      descriptionAr: "لب الباشن فروت الاستوائي مع النعناع والليمون ومياه الصودا الفوارة",
      imageUrl: "/uploads/products/passionfruit-mojito.jpg",
      basePrice: 18.0,
      sku: "REF-PAS-21",
      stockEnabled: false,
      variationMode: "NONE",
    },
  });

  // 22. Blueberry Lemonade
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.refreshers.id,
      nameEn: "Blueberry Lemonade Refresher",
      nameAr: "ليموناضة التوت الأزرق الطبيعية",
      descriptionEn: "Freshly squeezed lemons with wild blueberry compote and crushed ice",
      descriptionAr: "عصير ليمون طازج مع مربى التوت الأزرق البري والثلج المجروش",
      imageUrl: "/uploads/products/blueberry-lemonade.jpg",
      basePrice: 17.0,
      sku: "REF-BLU-22",
      stockEnabled: false,
      variationMode: "NONE",
    },
  });

  // 23. Strawberry Hibiscus
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.refreshers.id,
      nameEn: "Strawberry Hibiscus Iced Cooler",
      nameAr: "كركديه مثلج بالفراولة الطبيعية",
      descriptionEn: "Ruby cold-brewed hibiscus tea paired with sweet strawberry puree",
      descriptionAr: "كركديه مروق بارد مع هريس الفراولة الطازجة ونكهة حمضية خفيفة",
      imageUrl: "/uploads/products/strawberry-hibiscus.jpg",
      basePrice: 16.0,
      sku: "REF-HIB-23",
      stockEnabled: false,
      variationMode: "NONE",
    },
  });

  // --- Category 6: Artisan Sandwiches (Stock Enabled!) ---
  // 24. Turkey Croissant
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.sandwiches.id,
      nameEn: "Smoked Turkey & Emmental Croissant",
      nameAr: "كرواسون ديك رومي مدخن وجبنة إيمنتال",
      descriptionEn: "Flaky butter croissant filled with smoked turkey breast, melted swiss cheese, and honey mustard",
      descriptionAr: "كرواسون زبدة هش محشو بشرائح الديك الرومي وجبنة إيمنتال الذائبة",
      imageUrl: "/uploads/products/turkey-croissant.jpg",
      basePrice: 24.0,
      sku: "SND-TRK-24",
      stockEnabled: true,
      stockQuantity: 28,
      variationMode: "NONE",
    },
  });

  // 25. Halloumi Focaccia
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.sandwiches.id,
      nameEn: "Grilled Halloumi & Pesto Focaccia",
      nameAr: "فوكاشيا الحلوم المشوي وطماطم مجففة",
      descriptionEn: "Rosemary focaccia bread layered with seared halloumi, sundried tomato paste, and wild rocket",
      descriptionAr: "خبز الفوكاشيا بإكليل الجبل مع جبن حلوم مشوي ومعجون الطماطم المجففة والجرجير",
      imageUrl: "/uploads/products/halloumi-focaccia.jpg",
      basePrice: 22.0,
      sku: "SND-HAL-25",
      stockEnabled: true,
      stockQuantity: 20,
      variationMode: "NONE",
    },
  });

  // 26. Chicken Panini
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.sandwiches.id,
      nameEn: "Pesto Chicken & Mozzarella Panini",
      nameAr: "بانيني الدجاج بالبيستو والموزاريلا",
      descriptionEn: "Tender grilled chicken breast, fresh basil pesto, and fior di latte mozzarella on ciabatta",
      descriptionAr: "صدر دجاج مشوي متبل مع صلصة البيستو الإيطالية وجبنة موزاريلا ذائبة",
      imageUrl: "/uploads/products/chicken-panini.jpg",
      basePrice: 25.0,
      sku: "SND-CHK-26",
      stockEnabled: true,
      stockQuantity: 18,
      variationMode: "NONE",
    },
  });

  // --- Category 7: Bakery & Croissants (Stock Enabled!) ---
  // 27. Butter Croissant
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.bakery.id,
      nameEn: "Classic French Butter Croissant",
      nameAr: "كرواسون فرنسي كلاسيكي بالزبدة",
      descriptionEn: "Baked daily using Lescure French butter with golden flaky layers",
      descriptionAr: "مخبوز يومياً بزبدة فرنسية أصيلة بطبقات مقرمشة وهشة تذوب في الفم",
      imageUrl: "/uploads/products/butter-croissant.jpg",
      basePrice: 12.0,
      sku: "BAK-BUT-27",
      stockEnabled: true,
      stockQuantity: 42,
      variationMode: "NONE",
    },
  });

  // 28. Almond Croissant
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.bakery.id,
      nameEn: "Almond Cream Double-Baked Croissant",
      nameAr: "كرواسون اللوز المزدوج بالكريمة",
      descriptionEn: "Filled with rich frangipane almond cream and coated with toasted sliced almonds",
      descriptionAr: "محشو بكريمة اللوز الفاخرة ومغطى بشرائح اللوز المحمصة والسكر الناعم",
      imageUrl: "/uploads/products/almond-croissant.jpg",
      basePrice: 16.0,
      sku: "BAK-ALM-28",
      stockEnabled: true,
      stockQuantity: 24,
      variationMode: "NONE",
    },
  });

  // 29. Pain au Chocolat
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.bakery.id,
      nameEn: "Pain au Chocolat",
      nameAr: "بان أو شوكولا فرنسي بالكاكاو",
      descriptionEn: "Laminated viennoiserie pastry folded around two batons of Belgian dark chocolate",
      descriptionAr: "معجنات فرنسية هشة محشوة بقطع شوكولاتة بلجيكية فاخرة",
      imageUrl: "/uploads/products/pain-au-chocolat.jpg",
      basePrice: 15.0,
      sku: "BAK-CHO-29",
      stockEnabled: true,
      stockQuantity: 30,
      variationMode: "NONE",
    },
  });

  // 30. Cinnamon Roll
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.bakery.id,
      nameEn: "Gourmet Cinnamon Roll",
      nameAr: "سينامون رول غني بكريمة الجبن",
      descriptionEn: "Soft brioche roll swirled with Ceylon cinnamon and drenched in vanilla cream cheese glaze",
      descriptionAr: "عجينة بريوش طرية محشوة بالقرفة السيلانية ومغطاة بكريمة الجبن اللذيذة",
      imageUrl: "/uploads/products/cinnamon-roll.jpg",
      basePrice: 18.0,
      sku: "BAK-CIN-30",
      stockEnabled: true,
      stockQuantity: 16,
      variationMode: "NONE",
    },
  });

  // 31. Cardamom Bun
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.bakery.id,
      nameEn: "Swedish Spiced Cardamom Bun",
      nameAr: "لفافة الهيل السويدية التقليدية",
      descriptionEn: "Twisted kardemummabulle infused with freshly ground green cardamom pods",
      descriptionAr: "لفائف سويدية تقليدية بنكهة حبات الهيل الأخضر الطازجة وحبيبات السكر",
      imageUrl: "/uploads/products/cardamom-bun.jpg",
      basePrice: 14.0,
      sku: "BAK-CRD-31",
      stockEnabled: true,
      stockQuantity: 20,
      variationMode: "NONE",
    },
  });

  // --- Category 8: Cakes & Desserts (Stock Enabled!) ---
  // 32. San Sebastian
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.desserts.id,
      nameEn: "Basque San Sebastian Cheesecake",
      nameAr: "تشيز كيك سان سيباستيان الإسباني",
      descriptionEn: "Creamy baked cheesecake with a deeply caramelized exterior served with warm Belgian chocolate",
      descriptionAr: "تشيز كيك إسباني كريمي مخبوز بسطح مكرمل يُقدم مع صوص الشوكولاتة الذائبة",
      imageUrl: "/uploads/products/san-sebastian.jpg",
      basePrice: 26.0,
      sku: "DES-SAN-32",
      stockEnabled: true,
      stockQuantity: 15,
      variationMode: "NONE",
    },
  });

  // 33. Tiramisu
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.desserts.id,
      nameEn: "Classic Italian Espresso Tiramisu",
      nameAr: "تيراميسو إيطالي كلاسيكي بالإسبريسو",
      descriptionEn: "Layers of espresso-soaked savoiardi ladyfingers and whipped mascarpone cream dusted with Dutch cocoa",
      descriptionAr: "طبقات من أصابع البسكويت المشبعة بالإسبريسو وكريمة الماسكاربوني المخفوقة مع الكاكاو",
      imageUrl: "/uploads/products/tiramisu.jpg",
      basePrice: 24.0,
      sku: "DES-TIR-33",
      stockEnabled: true,
      stockQuantity: 18,
      variationMode: "NONE",
    },
  });

  // 34. Lava Cake
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.desserts.id,
      nameEn: "Molten Chocolate Lava Cake",
      nameAr: "كيكة الشوكولاتة الذائبة (لافا كيك)",
      descriptionEn: "Warm dark chocolate sponge oozing with a molten Belgian chocolate center",
      descriptionAr: "كيكة شوكولاتة داكنة دافئة بقلب شوكولاتة سائلة ذائبة لا تُقاوم",
      imageUrl: "/uploads/products/lava-cake.jpg",
      basePrice: 25.0,
      sku: "DES-LAV-34",
      stockEnabled: true,
      stockQuantity: 14,
      variationMode: "NONE",
    },
  });

  // 35. Carrot Cake
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.desserts.id,
      nameEn: "Spiced Walnut Carrot Cake",
      nameAr: "كيكة الجزر والجوز بالتوابل",
      descriptionEn: "Moist spiced carrot cake packed with roasted walnuts and cream cheese frosting",
      descriptionAr: "كيكة جزر هشة غنية بقطع الجوز المحمص والتوابل وكريمة الجبن اللذيذة",
      imageUrl: "/uploads/products/carrot-cake.jpg",
      basePrice: 22.0,
      sku: "DES-CAR-35",
      stockEnabled: true,
      stockQuantity: 12,
      variationMode: "NONE",
    },
  });

  // --- Category 9: Specialty Coffee Beans (VARIANT MODE with Cartesian combinations!) ---
  console.log("📦 Generating Variant Mode beans with full Cartesian combinations...");

  // 36. House Blend Beans
  const pBeansHouse = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.beans.id,
      nameEn: "Aroma House Blend Beans",
      nameAr: "حبوب محصول بلند أروما الخاص",
      descriptionEn: "Balanced medium-dark roast with chocolate, hazelnut, and caramel notes. Perfect for espresso",
      descriptionAr: "حمصة متوسطة متوازنة بنكهات الشوكولاتة، البندق والكراميل. مثالية لمشروبات الإسبريسو والحليب",
      imageUrl: "/uploads/products/beans-house-blend.jpg",
      basePrice: 65.0,
      sku: "BNS-HSE",
      stockEnabled: true,
      variationMode: "VARIANT",
    },
  });

  const grpWeight = await prisma.variationGroup.create({
    data: {
      itemId: pBeansHouse.id,
      nameEn: "Bag Weight",
      nameAr: "وزن العبوة",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 1,
    },
  });
  const optW250 = await prisma.variationOption.create({
    data: { variationGroupId: grpWeight.id, nameEn: "250g Bag", nameAr: "عبوة 250 جرام", priceAdjustment: 0.0, sortOrder: 1 },
  });
  const optW500 = await prisma.variationOption.create({
    data: { variationGroupId: grpWeight.id, nameEn: "500g Bag", nameAr: "عبوة 500 جرام", priceAdjustment: 50.0, sortOrder: 2 },
  });
  const optW1000 = await prisma.variationOption.create({
    data: { variationGroupId: grpWeight.id, nameEn: "1kg Bag", nameAr: "عبوة 1 كجم", priceAdjustment: 140.0, sortOrder: 3 },
  });

  const grpGrind = await prisma.variationGroup.create({
    data: {
      itemId: pBeansHouse.id,
      nameEn: "Grind Type",
      nameAr: "نوع الطحن",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 2,
    },
  });
  const optWhole = await prisma.variationOption.create({
    data: { variationGroupId: grpGrind.id, nameEn: "Whole Bean", nameAr: "حبوب كاملة (بدون طحن)", priceAdjustment: 0.0, sortOrder: 1 },
  });
  const optEspresso = await prisma.variationOption.create({
    data: { variationGroupId: grpGrind.id, nameEn: "Fine (Espresso)", nameAr: "ناعم (إسبريسو)", priceAdjustment: 0.0, sortOrder: 2 },
  });
  const optV60 = await prisma.variationOption.create({
    data: { variationGroupId: grpGrind.id, nameEn: "Medium (Filter V60)", nameAr: "متوسط (فلتر V60)", priceAdjustment: 0.0, sortOrder: 3 },
  });

  const houseWeights = [
    { opt: optW250, price: 65.0, label: "250g", code: "250" },
    { opt: optW500, price: 115.0, label: "500g", code: "500" },
    { opt: optW1000, price: 205.0, label: "1kg", code: "1KG" },
  ];
  const houseGrinds = [
    { opt: optWhole, label: "Whole", code: "WHL" },
    { opt: optEspresso, label: "Espresso", code: "ESP" },
    { opt: optV60, label: "V60", code: "V60" },
  ];

  for (const w of houseWeights) {
    for (const g of houseGrinds) {
      const variant = await prisma.productVariant.create({
        data: {
          itemId: pBeansHouse.id,
          sku: `BNS-HSE-${w.code}-${g.code}`,
          barcode: `628900${w.code}${g.code}`,
          price: w.price,
          stockQuantity: 25,
          active: true,
        },
      });

      await prisma.productVariantOption.createMany({
        data: [
          { productVariantId: variant.id, variationGroupId: grpWeight.id, variationOptionId: w.opt.id },
          { productVariantId: variant.id, variationGroupId: grpGrind.id, variationOptionId: g.opt.id },
        ],
      });
    }
  }

  // 37. Ethiopia Yirgacheffe Beans
  const pBeansYirg = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.beans.id,
      nameEn: "Ethiopia Yirgacheffe Specialty Beans",
      nameAr: "محصول إثيوبيا يرجاشيفي المختص",
      descriptionEn: "Natural processed heirloom variety with notes of blueberry, peach blossom, and honey",
      descriptionAr: "معالجة مجففة بسلالة هيرلوم الفاخرة مع إيحاءات التوت الأزرق، زهر الخوخ والعسل الصافي",
      imageUrl: "/uploads/products/beans-yirgacheffe.jpg",
      basePrice: 75.0,
      sku: "BNS-YRG",
      stockEnabled: true,
      variationMode: "VARIANT",
    },
  });

  const grpYirgWeight = await prisma.variationGroup.create({
    data: { itemId: pBeansYirg.id, nameEn: "Weight", nameAr: "الوزن", required: true, selectionType: "SINGLE", sortOrder: 1 },
  });
  const optY250 = await prisma.variationOption.create({
    data: { variationGroupId: grpYirgWeight.id, nameEn: "250g", nameAr: "250 جرام", priceAdjustment: 0.0, sortOrder: 1 },
  });
  const optY1000 = await prisma.variationOption.create({
    data: { variationGroupId: grpYirgWeight.id, nameEn: "1kg", nameAr: "1 كجم", priceAdjustment: 165.0, sortOrder: 2 },
  });

  const grpYirgGrind = await prisma.variationGroup.create({
    data: { itemId: pBeansYirg.id, nameEn: "Grind", nameAr: "نوع الطحن", required: true, selectionType: "SINGLE", sortOrder: 2 },
  });
  const optYWhole = await prisma.variationOption.create({
    data: { variationGroupId: grpYirgGrind.id, nameEn: "Whole Bean", nameAr: "حبوب كاملة", priceAdjustment: 0.0, sortOrder: 1 },
  });
  const optYV60 = await prisma.variationOption.create({
    data: { variationGroupId: grpYirgGrind.id, nameEn: "V60 Filter Grind", nameAr: "طحنة فلتر V60", priceAdjustment: 0.0, sortOrder: 2 },
  });

  for (const w of [{ opt: optY250, price: 75.0, code: "250" }, { opt: optY1000, price: 240.0, code: "1KG" }]) {
    for (const g of [{ opt: optYWhole, code: "WHL" }, { opt: optYV60, code: "V60" }]) {
      const variant = await prisma.productVariant.create({
        data: {
          itemId: pBeansYirg.id,
          sku: `BNS-YRG-${w.code}-${g.code}`,
          barcode: `628901${w.code}${g.code}`,
          price: w.price,
          stockQuantity: 20,
          active: true,
        },
      });
      await prisma.productVariantOption.createMany({
        data: [
          { productVariantId: variant.id, variationGroupId: grpYirgWeight.id, variationOptionId: w.opt.id },
          { productVariantId: variant.id, variationGroupId: grpYirgGrind.id, variationOptionId: g.opt.id },
        ],
      });
    }
  }

  // 38. Panama Geisha Reserve
  const pBeansGeisha = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMap.beans.id,
      nameEn: "Panama Boquete Geisha Limited Reserve",
      nameAr: "محصول بنما بوكيتي جيشا الإصدار المحدود",
      descriptionEn: "World-renowned washed Geisha from the slopes of Volcán Barú. Extraordinary jasmine, bergamot & mango nectar",
      descriptionAr: "القهوة الأرقى عالمياً من مرتفعات بركان بارو. إيحاءات استثنائية من الياسمين، البرغموت ورحيق المانجو",
      imageUrl: "/uploads/products/beans-geisha.jpg",
      basePrice: 140.0,
      sku: "BNS-GSH",
      stockEnabled: true,
      variationMode: "VARIANT",
    },
  });

  const grpGshWeight = await prisma.variationGroup.create({
    data: { itemId: pBeansGeisha.id, nameEn: "Weight", nameAr: "الوزن", required: true, selectionType: "SINGLE", sortOrder: 1 },
  });
  const optG125 = await prisma.variationOption.create({
    data: { variationGroupId: grpGshWeight.id, nameEn: "125g Tin", nameAr: "علبة 125 جرام فاخرة", priceAdjustment: 0.0, sortOrder: 1 },
  });
  const optG250 = await prisma.variationOption.create({
    data: { variationGroupId: grpGshWeight.id, nameEn: "250g Tin", nameAr: "علبة 250 جرام فاخرة", priceAdjustment: 120.0, sortOrder: 2 },
  });

  const grpGshGrind = await prisma.variationGroup.create({
    data: { itemId: pBeansGeisha.id, nameEn: "Grind", nameAr: "نوع الطحن", required: true, selectionType: "SINGLE", sortOrder: 2 },
  });
  const optGWhole = await prisma.variationOption.create({
    data: { variationGroupId: grpGshGrind.id, nameEn: "Whole Bean", nameAr: "حبوب كاملة", priceAdjustment: 0.0, sortOrder: 1 },
  });
  const optGFilter = await prisma.variationOption.create({
    data: { variationGroupId: grpGshGrind.id, nameEn: "Filter Grind", nameAr: "طحن فلتر ترشيح", priceAdjustment: 0.0, sortOrder: 2 },
  });

  for (const w of [{ opt: optG125, price: 140.0, code: "125" }, { opt: optG250, price: 260.0, code: "250" }]) {
    for (const g of [{ opt: optGWhole, code: "WHL" }, { opt: optGFilter, code: "FLT" }]) {
      const variant = await prisma.productVariant.create({
        data: {
          itemId: pBeansGeisha.id,
          sku: `BNS-GSH-${w.code}-${g.code}`,
          barcode: `628902${w.code}${g.code}`,
          price: w.price,
          stockQuantity: 15,
          active: true,
        },
      });
      await prisma.productVariantOption.createMany({
        data: [
          { productVariantId: variant.id, variationGroupId: grpGshWeight.id, variationOptionId: w.opt.id },
          { productVariantId: variant.id, variationGroupId: grpGshGrind.id, variationOptionId: g.opt.id },
        ],
      });
    }
  }

  console.log("✓ Seeded all 38 products across 9 categories with exact images and variations!");

  // 6. Seed realistic initial sales
  console.log("🧾 Creating initial demo sales and invoices...");
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.toTimeString().split(" ")[0].substring(0, 5);

  const sale1 = await prisma.sale.create({
    data: {
      businessId: business.id,
      userId: staff.id,
      subtotal: 31.0,
      discountType: "NONE",
      discountValue: 0.0,
      discountAmount: 0.0,
      taxAmount: 0.0,
      totalAmount: 31.0,
      paymentMethod: "CARD",
      orderType: "TAKEAWAY",
      status: "COMPLETED",
      items: {
        create: [
          {
            itemId: pIcedSpanish.id,
            itemNameEnSnapshot: "Iced Spanish Latte",
            itemNameArSnapshot: "آيس سبانش لاتيه",
            quantity: 1,
            baseUnitPrice: 19.0,
            variationAmount: 0.0,
            unitPrice: 19.0,
            lineTotal: 19.0,
          },
          {
            itemId: pCappuccino.id,
            itemNameEnSnapshot: "Classic French Butter Croissant",
            itemNameArSnapshot: "كرواسون فرنسي كلاسيكي بالزبدة",
            quantity: 1,
            baseUnitPrice: 12.0,
            variationAmount: 0.0,
            unitPrice: 12.0,
            lineTotal: 12.0,
          },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      businessId: business.id,
      saleId: sale1.id,
      invoiceNumber: "INV-000101",
      issueDate: dateStr,
      issueTime: timeStr,
      businessNameEn: business.nameEn,
      businessNameAr: business.nameAr,
      businessAddressEn: business.addressEn,
      businessAddressAr: business.addressAr,
      subtotal: 31.0,
      discount: 0.0,
      tax: 0.0,
      totalAmount: 31.0,
      paymentMethod: "CARD",
      status: "ISSUED",
    },
  });

  const sale2 = await prisma.sale.create({
    data: {
      businessId: business.id,
      userId: admin.id,
      subtotal: 48.0,
      discountType: "PERCENTAGE",
      discountValue: 10.0,
      discountAmount: 4.8,
      taxAmount: 0.0,
      totalAmount: 43.2,
      paymentMethod: "CASH",
      orderType: "DINE_IN",
      status: "COMPLETED",
      items: {
        create: [
          {
            itemId: pV60Eth.id,
            itemNameEnSnapshot: "V60 Ethiopia Yirgacheffe",
            itemNameArSnapshot: "V60 إثيوبيا يرجاشيفي المختصة",
            quantity: 1,
            baseUnitPrice: 22.0,
            variationAmount: 0.0,
            unitPrice: 22.0,
            lineTotal: 22.0,
          },
          {
            itemId: pCappuccino.id,
            itemNameEnSnapshot: "Basque San Sebastian Cheesecake",
            itemNameArSnapshot: "تشيز كيك سان سيباستيان الإسباني",
            quantity: 1,
            baseUnitPrice: 26.0,
            variationAmount: 0.0,
            unitPrice: 26.0,
            lineTotal: 26.0,
          },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      businessId: business.id,
      saleId: sale2.id,
      invoiceNumber: "INV-000102",
      issueDate: dateStr,
      issueTime: timeStr,
      businessNameEn: business.nameEn,
      businessNameAr: business.nameAr,
      businessAddressEn: business.addressEn,
      businessAddressAr: business.addressAr,
      subtotal: 48.0,
      discount: 4.8,
      tax: 0.0,
      totalAmount: 43.2,
      paymentMethod: "CASH",
      status: "ISSUED",
    },
  });

  console.log("🎉 Seeding complete on Neon PostgreSQL! Database is completely loaded.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
