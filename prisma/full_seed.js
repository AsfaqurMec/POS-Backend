const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting full database seed on Neon PostgreSQL...");

  // 1. Clean existing tables (in foreign-key safe order)
  console.log("Cleaning old records...");
  await prisma.saleItemOption.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.productVariantOption.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.variationOption.deleteMany();
  await prisma.variationGroup.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();
  await prisma.invoiceSequence.deleteMany();

  // 2. Business Profile
  console.log("Creating business profile...");
  const business = await prisma.business.create({
    data: {
      id: "aroma-coffee-shop-id",
      nameEn: "Aroma Specialty Coffee",
      nameAr: "مقهى أروما للقهوة المختصة",
      logoUrl: "/uploads/businesses/logo.svg",
      phone: "+966 50 123 4567",
      addressEn: "Olaya Street, Al Olaya District, Riyadh, Saudi Arabia",
      addressAr: "شارع العليا، حي العليا، الرياض، المملكة العربية السعودية",
      currency: "SAR",
      timezone: "Asia/Riyadh",
      taxEnabled: false,
      taxRate: 0.0,
      pricingMode: "INCLUSIVE",
      invoicePrefix: "INV-",
      receiptFooterEn: "Thank you for visiting Aroma Specialty Coffee! Have a wonderful day.",
      receiptFooterAr: "شكراً لزيارتكم مقهى أروما للقهوة المختصة! نتمنى لكم يوماً رائعاً ونسعد بخدمتكم دائماً.",
    },
  });

  // 3. Invoice Sequence
  await prisma.invoiceSequence.create({
    data: {
      prefix: "INV-",
      currentNumber: 102,
    },
  });

  // 4. Users (Manager and Cashiers)
  console.log("Creating users...");
  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const staffPasswordHash = await bcrypt.hash("staff123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Store Manager",
      email: "admin@aromacoffee.com",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      name: "Ahmed Barista",
      email: "staff@aromacoffee.com",
      passwordHash: staffPasswordHash,
      role: "STAFF",
      status: "ACTIVE",
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      name: "Sara Al-Otaibi",
      email: "sara@aromacoffee.com",
      passwordHash: staffPasswordHash,
      role: "STAFF",
      status: "ACTIVE",
    },
  });

  // 5. Categories
  console.log("Creating categories with images...");
  const catHot = await prisma.category.create({
    data: {
      businessId: business.id,
      nameEn: "Hot Coffee",
      nameAr: "قهوة ساخنة",
      descriptionEn: "Freshly brewed espresso & hot handcrafted drinks",
      descriptionAr: "إسبريسو ومشروبات القهوة الساخنة المحضرة يدوياً",
      imageUrl: "/uploads/categories/hot-coffee.svg",
      sortOrder: 1,
      active: true,
    },
  });

  const catIced = await prisma.category.create({
    data: {
      businessId: business.id,
      nameEn: "Iced Drinks",
      nameAr: "مشروبات باردة",
      descriptionEn: "Refreshing iced lattes, cold brews & refreshers",
      descriptionAr: "آيس لاتيه ومشروبات القهوة الباردة والمنعشة",
      imageUrl: "/uploads/categories/iced-drinks.svg",
      sortOrder: 2,
      active: true,
    },
  });

  const catMatcha = await prisma.category.create({
    data: {
      businessId: business.id,
      nameEn: "Tea & Matcha",
      nameAr: "شاي وماتشا",
      descriptionEn: "Ceremonial Japanese matcha & specialty teas",
      descriptionAr: "ماتشا يابانية فاخرة وشاي مختص",
      imageUrl: "/uploads/categories/tea-matcha.svg",
      sortOrder: 3,
      active: true,
    },
  });

  const catBakery = await prisma.category.create({
    data: {
      businessId: business.id,
      nameEn: "Bakery & Sweets",
      nameAr: "مخبوزات وحلويات",
      descriptionEn: "Fresh French croissants, muffins & artisanal cakes",
      descriptionAr: "كرواسون فرنسي طازج، مافن وحلويات مخبوزة يومياً",
      imageUrl: "/uploads/categories/bakery.svg",
      sortOrder: 4,
      active: true,
    },
  });

  const catBeans = await prisma.category.create({
    data: {
      businessId: business.id,
      nameEn: "Specialty Beans",
      nameAr: "حبوب القهوة المختصة",
      descriptionEn: "Single-origin and artisan roasted blend packages",
      descriptionAr: "محاصيل وحبوب قهوة مختصة فردية المصدر وخلطات مميزة",
      imageUrl: "/uploads/categories/beans.svg",
      sortOrder: 5,
      active: true,
    },
  });

  // 6. Products: Hot Coffee (OPTION MODE)
  console.log("Creating Hot Coffee items with options...");
  
  // Cappuccino
  const cappuccino = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catHot.id,
      nameEn: "Cappuccino",
      nameAr: "كابتشينو",
      descriptionEn: "Rich double shot espresso with silky microfoam",
      descriptionAr: "إسبريسو غني مضاعف مع رغوة حليب مخملية ناعمة",
      imageUrl: "/uploads/products/cappuccino.svg",
      basePrice: 14.0,
      sku: "HOT-CAP-001",
      barcode: "6281001001",
      variationMode: "OPTION",
      stockEnabled: false,
      active: true,
      variationGroups: {
        create: [
          {
            nameEn: "Size",
            nameAr: "الحجم",
            required: true,
            selectionType: "SINGLE",
            sortOrder: 1,
            options: {
              create: [
                { nameEn: "Small (8oz)", nameAr: "صغير (8 أونصة)", priceAdjustment: 0.0, sortOrder: 1 },
                { nameEn: "Medium (12oz)", nameAr: "وسط (12 أونصة)", priceAdjustment: 3.0, sortOrder: 2 },
                { nameEn: "Large (16oz)", nameAr: "كبير (16 أونصة)", priceAdjustment: 5.0, sortOrder: 3 },
              ],
            },
          },
          {
            nameEn: "Milk Choice",
            nameAr: "نوع الحليب",
            required: true,
            selectionType: "SINGLE",
            sortOrder: 2,
            options: {
              create: [
                { nameEn: "Whole Milk", nameAr: "حليب طازج كامل الدسم", priceAdjustment: 0.0, sortOrder: 1 },
                { nameEn: "Oat Milk", nameAr: "حليب شوفان عضوي", priceAdjustment: 4.0, sortOrder: 2 },
                { nameEn: "Almond Milk", nameAr: "حليب لوز", priceAdjustment: 4.0, sortOrder: 3 },
                { nameEn: "Skimmed Milk", nameAr: "حليب قليل الدسم", priceAdjustment: 0.0, sortOrder: 4 },
              ],
            },
          },
          {
            nameEn: "Extras & Syrups",
            nameAr: "إضافات ونكهات",
            required: false,
            selectionType: "MULTIPLE",
            sortOrder: 3,
            options: {
              create: [
                { nameEn: "Extra Espresso Shot", nameAr: "شوت إسبريسو إضافي", priceAdjustment: 3.0, sortOrder: 1 },
                { nameEn: "Vanilla Syrup", nameAr: "سيرب فانيليا مدغشقر", priceAdjustment: 2.5, sortOrder: 2 },
                { nameEn: "Caramel Drizzle", nameAr: "صوص كراميل بلجيكي", priceAdjustment: 2.0, sortOrder: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Spanish Latte (Hot)
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catHot.id,
      nameEn: "Spanish Latte",
      nameAr: "سبانش لاتيه ساخن",
      descriptionEn: "Smooth espresso combined with sweet condensed milk",
      descriptionAr: "إسبريسو ناعم مع الحليب المحلى المكثف ورسمة لاتيه",
      imageUrl: "/uploads/products/spanish-latte.svg",
      basePrice: 18.0,
      sku: "HOT-SPL-001",
      barcode: "6281001002",
      variationMode: "OPTION",
      stockEnabled: false,
      active: true,
      variationGroups: {
        create: [
          {
            nameEn: "Size",
            nameAr: "الحجم",
            required: true,
            selectionType: "SINGLE",
            sortOrder: 1,
            options: {
              create: [
                { nameEn: "Regular (12oz)", nameAr: "وسط (12 أونصة)", priceAdjustment: 0.0, sortOrder: 1 },
                { nameEn: "Large (16oz)", nameAr: "كبير (16 أونصة)", priceAdjustment: 4.0, sortOrder: 2 },
              ],
            },
          },
          {
            nameEn: "Sweetness",
            nameAr: "درجة الحلاوة",
            required: true,
            selectionType: "SINGLE",
            sortOrder: 2,
            options: {
              create: [
                { nameEn: "Normal Sweet", nameAr: "حلاوة عادية", priceAdjustment: 0.0, sortOrder: 1 },
                { nameEn: "Less Sweet (50%)", nameAr: "حلاوة خفيفة (50%)", priceAdjustment: 0.0, sortOrder: 2 },
                { nameEn: "Extra Sweet", nameAr: "حلاوة زيادة", priceAdjustment: 0.0, sortOrder: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Americano (Hot)
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catHot.id,
      nameEn: "Classic Americano",
      nameAr: "أمريكانو كلاسيك",
      descriptionEn: "Double espresso poured over hot water with rich crema",
      descriptionAr: "إسبريسو مضاعف مسكوب فوق ماء ساخن مع كريما غنية",
      imageUrl: "/uploads/products/americano.svg",
      basePrice: 12.0,
      sku: "HOT-AME-001",
      barcode: "6281001003",
      variationMode: "OPTION",
      stockEnabled: false,
      active: true,
      variationGroups: {
        create: [
          {
            nameEn: "Size",
            nameAr: "الحجم",
            required: true,
            selectionType: "SINGLE",
            options: {
              create: [
                { nameEn: "Small (8oz)", nameAr: "صغير (8 أونصة)", priceAdjustment: 0.0 },
                { nameEn: "Medium (12oz)", nameAr: "وسط (12 أونصة)", priceAdjustment: 2.0 },
                { nameEn: "Large (16oz)", nameAr: "كبير (16 أونصة)", priceAdjustment: 4.0 },
              ],
            },
          },
        ],
      },
    },
  });

  // Flat White
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catHot.id,
      nameEn: "Flat White",
      nameAr: "فلات وايت",
      descriptionEn: "Bold ristretto espresso with finely textured microfoam",
      descriptionAr: "ريستريتو إسبريسو مكثف مع رغوة حليب ناعمة جداً",
      imageUrl: "/uploads/products/flat-white.svg",
      basePrice: 16.0,
      sku: "HOT-FLT-001",
      barcode: "6281001004",
      variationMode: "OPTION",
      stockEnabled: false,
      active: true,
      variationGroups: {
        create: [
          {
            nameEn: "Milk Choice",
            nameAr: "نوع الحليب",
            required: true,
            selectionType: "SINGLE",
            options: {
              create: [
                { nameEn: "Whole Milk", nameAr: "حليب طازج كامل الدسم", priceAdjustment: 0.0 },
                { nameEn: "Oat Milk", nameAr: "حليب شوفان", priceAdjustment: 4.0 },
                { nameEn: "Almond Milk", nameAr: "حليب لوز", priceAdjustment: 4.0 },
              ],
            },
          },
        ],
      },
    },
  });

  // 7. Products: Iced Drinks (OPTION MODE)
  console.log("Creating Iced Drinks items...");

  // Iced Spanish Latte
  const icedSpanish = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catIced.id,
      nameEn: "Iced Spanish Latte",
      nameAr: "سبانش لاتيه بارد",
      descriptionEn: "Sweetened milk, espresso shot poured over crystal clear ice",
      descriptionAr: "مشروب سبانش لاتيه البارد الشهير مع مكعبات الثلج النقية",
      imageUrl: "/uploads/products/iced-spanish-latte.svg",
      basePrice: 19.0,
      sku: "COLD-SPL-001",
      barcode: "6281002001",
      variationMode: "OPTION",
      stockEnabled: false,
      active: true,
      variationGroups: {
        create: [
          {
            nameEn: "Size",
            nameAr: "الحجم",
            required: true,
            selectionType: "SINGLE",
            sortOrder: 1,
            options: {
              create: [
                { nameEn: "Regular (16oz)", nameAr: "وسط (16 أونصة)", priceAdjustment: 0.0 },
                { nameEn: "Large (20oz)", nameAr: "كبير (20 أونصة)", priceAdjustment: 4.0 },
              ],
            },
          },
          {
            nameEn: "Ice Level",
            nameAr: "مستوى الثلج",
            required: true,
            selectionType: "SINGLE",
            sortOrder: 2,
            options: {
              create: [
                { nameEn: "Normal Ice", nameAr: "ثلج عادي", priceAdjustment: 0.0 },
                { nameEn: "Less Ice", nameAr: "ثلج قليل", priceAdjustment: 0.0 },
                { nameEn: "No Ice", nameAr: "بدون ثلج", priceAdjustment: 0.0 },
              ],
            },
          },
          {
            nameEn: "Sweetness",
            nameAr: "درجة الحلاوة",
            required: true,
            selectionType: "SINGLE",
            sortOrder: 3,
            options: {
              create: [
                { nameEn: "Normal Sweet", nameAr: "حلاوة عادية", priceAdjustment: 0.0 },
                { nameEn: "Less Sweet", nameAr: "حلاوة خفيفة", priceAdjustment: 0.0 },
                { nameEn: "Extra Sweet", nameAr: "حلاوة زيادة", priceAdjustment: 0.0 },
              ],
            },
          },
        ],
      },
    },
  });

  // Iced Salted Caramel Latte
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catIced.id,
      nameEn: "Iced Salted Caramel Latte",
      nameAr: "آيس كراميل مملح لاتيه",
      descriptionEn: "Espresso, salted caramel syrup, topped with sweet cold foam",
      descriptionAr: "إسبريسو ممزوج بكراميل مملح مع فوم بارد لذيذ",
      imageUrl: "/uploads/products/iced-salted-caramel.svg",
      basePrice: 21.0,
      sku: "COLD-CAR-001",
      barcode: "6281002002",
      variationMode: "OPTION",
      stockEnabled: false,
      active: true,
      variationGroups: {
        create: [
          {
            nameEn: "Size",
            nameAr: "الحجم",
            required: true,
            selectionType: "SINGLE",
            options: {
              create: [
                { nameEn: "Regular (16oz)", nameAr: "وسط (16 أونصة)", priceAdjustment: 0.0 },
                { nameEn: "Large (20oz)", nameAr: "كبير (20 أونصة)", priceAdjustment: 4.0 },
              ],
            },
          },
          {
            nameEn: "Topping",
            nameAr: "الطبقة العلوية",
            required: false,
            selectionType: "SINGLE",
            options: {
              create: [
                { nameEn: "Salted Caramel Cold Foam", nameAr: "فوم كراميل مملح", priceAdjustment: 4.0 },
              ],
            },
          },
        ],
      },
    },
  });

  // Cold Brew Reserve
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catIced.id,
      nameEn: "Cold Brew Reserve",
      nameAr: "كولد برو كلاسيك ريزيرف",
      descriptionEn: "18-hour slow cold water steeped single-origin coffee",
      descriptionAr: "قهوة مقطرة بالماء البارد ببطء لمدة 18 ساعة لنكهة نقية",
      imageUrl: "/uploads/products/cold-brew.svg",
      basePrice: 18.0,
      sku: "COLD-BRW-001",
      barcode: "6281002003",
      variationMode: "OPTION",
      stockEnabled: false,
      active: true,
      variationGroups: {
        create: [
          {
            nameEn: "Ice Level",
            nameAr: "مستوى الثلج",
            required: true,
            selectionType: "SINGLE",
            options: {
              create: [
                { nameEn: "Normal Ice", nameAr: "ثلج عادي", priceAdjustment: 0.0 },
                { nameEn: "Less Ice", nameAr: "ثلج قليل", priceAdjustment: 0.0 },
              ],
            },
          },
        ],
      },
    },
  });

  // 8. Products: Tea & Matcha (OPTION MODE)
  console.log("Creating Tea & Matcha items...");
  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catMatcha.id,
      nameEn: "Iced Ceremonial Matcha Latte",
      nameAr: "آيس ماتشا لاتيه يابانية",
      descriptionEn: "Authentic Kyoto ceremonial grade matcha with milk over ice",
      descriptionAr: "ماتشا احتفالية أصلية من كيوتو مع الحليب والثلج",
      imageUrl: "/uploads/products/matcha-latte.svg",
      basePrice: 22.0,
      sku: "TEA-MAT-001",
      barcode: "6281003001",
      variationMode: "OPTION",
      stockEnabled: false,
      active: true,
      variationGroups: {
        create: [
          {
            nameEn: "Milk Choice",
            nameAr: "نوع الحليب",
            required: true,
            selectionType: "SINGLE",
            options: {
              create: [
                { nameEn: "Oat Milk", nameAr: "حليب شوفان", priceAdjustment: 0.0 },
                { nameEn: "Almond Milk", nameAr: "حليب لوز", priceAdjustment: 0.0 },
                { nameEn: "Coconut Milk", nameAr: "حليب جوز الهند", priceAdjustment: 3.0 },
              ],
            },
          },
        ],
      },
    },
  });

  // 9. Products: Bakery & Sweets (NONE MODE - Tracked Stock)
  console.log("Creating Bakery & Pastry items...");
  const croissant = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catBakery.id,
      nameEn: "Butter Croissant",
      nameAr: "كرواسون زبدة فرنسي",
      descriptionEn: "Golden flaky and buttery artisan French croissant",
      descriptionAr: "كرواسون فرنسي كلاسيكي هش ومقرمش غني بالزبدة الطبيعية",
      imageUrl: "/uploads/products/butter-croissant.svg",
      basePrice: 10.0,
      sku: "BAK-CRS-001",
      barcode: "6281004001",
      variationMode: "NONE",
      stockEnabled: true,
      stockQuantity: 35,
      active: true,
    },
  });

  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catBakery.id,
      nameEn: "Almond Croissant",
      nameAr: "كرواسون باللوز المحمص",
      descriptionEn: "Double baked croissant with almond frangipane & toasted flakes",
      descriptionAr: "كرواسون محشو بكريمة اللوز ومغطى بشرائح اللوز المقرمشة",
      imageUrl: "/uploads/products/almond-croissant.svg",
      basePrice: 14.0,
      sku: "BAK-ALM-001",
      barcode: "6281004002",
      variationMode: "NONE",
      stockEnabled: true,
      stockQuantity: 22,
      active: true,
    },
  });

  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catBakery.id,
      nameEn: "Double Chocolate Muffin",
      nameAr: "مافن الشوكولاتة البلجيكية",
      descriptionEn: "Moist dark cocoa muffin loaded with Belgian chocolate chunks",
      descriptionAr: "مافن شوكولاتة طري مع قطع شوكولاتة بلجيكية فاخرة",
      imageUrl: "/uploads/products/chocolate-muffin.svg",
      basePrice: 13.0,
      sku: "BAK-MUF-001",
      barcode: "6281004003",
      variationMode: "NONE",
      stockEnabled: true,
      stockQuantity: 20,
      active: true,
    },
  });

  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catBakery.id,
      nameEn: "Pecan Cinnamon Roll",
      nameAr: "سينامون رول بالبيكان والكراميل",
      descriptionEn: "Warm cinnamon swirl with vanilla cream glaze & toasted pecans",
      descriptionAr: "لفائف القرفة الطرية مع صوص الفانيليا وحبات البيكان المحمصة",
      imageUrl: "/uploads/products/cinnamon-roll.svg",
      basePrice: 16.0,
      sku: "BAK-CIN-001",
      barcode: "6281004004",
      variationMode: "NONE",
      stockEnabled: true,
      stockQuantity: 18,
      active: true,
    },
  });

  await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catBakery.id,
      nameEn: "San Sebastian Cheesecake",
      nameAr: "تشيز كيك سان سباستيان",
      descriptionEn: "Basque burnt cheesecake with creamy interior & Belgian chocolate sauce",
      descriptionAr: "تشيز كيك باسكي مخبوز بكراميل شهي مع صوص الشوكولاتة البلجيكية",
      imageUrl: "/uploads/products/san-sebastian.svg",
      basePrice: 24.0,
      sku: "BAK-SAN-001",
      barcode: "6281004005",
      variationMode: "NONE",
      stockEnabled: true,
      stockQuantity: 14,
      active: true,
    },
  });

  // 10. Products: Specialty Beans (VARIANT MODE - Cartesian Combinations)
  console.log("Creating Specialty Beans with physical variants...");

  // Product 1: Aroma House Blend (250g)
  const beansHouse = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catBeans.id,
      nameEn: "Aroma House Blend (250g)",
      nameAr: "خلطة بلند أروما الخاص (250 جرام)",
      descriptionEn: "Signature 100% Arabica blend with milk chocolate & hazelnut notes",
      descriptionAr: "محصول أروما المميز أرابيكا 100% بإيحاءات شوكولاتة الحليب والبندق",
      imageUrl: "/uploads/products/beans-house-blend.svg",
      basePrice: 45.0,
      sku: "BN-AROMA",
      barcode: "6281005001",
      variationMode: "VARIANT",
      stockEnabled: true,
      stockQuantity: 45,
      active: true,
    },
  });

  const bRoastGroup = await prisma.variationGroup.create({
    data: {
      itemId: beansHouse.id,
      nameEn: "Roast Level",
      nameAr: "درجة التحميص",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 1,
    },
  });

  const optMedRoast = await prisma.variationOption.create({
    data: { variationGroupId: bRoastGroup.id, nameEn: "Medium Roast", nameAr: "تحميص متوسط", sortOrder: 1 },
  });
  const optDarkRoast = await prisma.variationOption.create({
    data: { variationGroupId: bRoastGroup.id, nameEn: "Dark Roast", nameAr: "تحميص داكن", sortOrder: 2 },
  });

  const bGrindGroup = await prisma.variationGroup.create({
    data: {
      itemId: beansHouse.id,
      nameEn: "Grind Type",
      nameAr: "نوع الطحن",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 2,
    },
  });

  const optWholeBeans = await prisma.variationOption.create({
    data: { variationGroupId: bGrindGroup.id, nameEn: "Whole Beans", nameAr: "حبوب كاملة", sortOrder: 1 },
  });
  const optEspressoGrind = await prisma.variationOption.create({
    data: { variationGroupId: bGrindGroup.id, nameEn: "Espresso Ground", nameAr: "مطحونة إسبريسو", sortOrder: 2 },
  });
  const optFilterGrind = await prisma.variationOption.create({
    data: { variationGroupId: bGrindGroup.id, nameEn: "V60 Filter Ground", nameAr: "مطحونة فلتر V60", sortOrder: 3 },
  });

  // Create real variants for House Blend (2 x 3 = 6 combinations)
  const variantsData = [
    { roast: optMedRoast, grind: optWholeBeans, sku: "BN-MED-WB", price: 45.0, stock: 15 },
    { roast: optMedRoast, grind: optEspressoGrind, sku: "BN-MED-EG", price: 47.0, stock: 12 },
    { roast: optMedRoast, grind: optFilterGrind, sku: "BN-MED-FG", price: 47.0, stock: 10 },
    { roast: optDarkRoast, grind: optWholeBeans, sku: "BN-DRK-WB", price: 45.0, stock: 14 },
    { roast: optDarkRoast, grind: optEspressoGrind, sku: "BN-DRK-EG", price: 47.0, stock: 9 },
    { roast: optDarkRoast, grind: optFilterGrind, sku: "BN-DRK-FG", price: 47.0, stock: 8 },
  ];

  for (const vd of variantsData) {
    await prisma.productVariant.create({
      data: {
        itemId: beansHouse.id,
        sku: vd.sku,
        barcode: `6281005${vd.sku.replace(/-/g, "")}`,
        price: vd.price,
        stockQuantity: vd.stock,
        active: true,
        variantOptions: {
          create: [
            { variationGroupId: bRoastGroup.id, variationOptionId: vd.roast.id },
            { variationGroupId: bGrindGroup.id, variationOptionId: vd.grind.id },
          ],
        },
      },
    });
  }

  // Product 2: Ethiopia Yirgacheffe (250g)
  const beansEth = await prisma.item.create({
    data: {
      businessId: business.id,
      categoryId: catBeans.id,
      nameEn: "Ethiopia Yirgacheffe (250g)",
      nameAr: "إثيوبيا يرغاتشيفي مختصة (250 جرام)",
      descriptionEn: "Single-origin washed Ethiopian Arabica with floral bergamot & peach notes",
      descriptionAr: "محصول إثيوبي فاخر مغسول بإيحاءات الزهور والبرغموت والخوخ",
      imageUrl: "/uploads/products/beans-yirgacheffe.svg",
      basePrice: 55.0,
      sku: "BN-ETH-YIR",
      barcode: "6281005002",
      variationMode: "VARIANT",
      stockEnabled: true,
      stockQuantity: 30,
      active: true,
    },
  });

  const ethRoastGroup = await prisma.variationGroup.create({
    data: {
      itemId: beansEth.id,
      nameEn: "Roast Level",
      nameAr: "درجة التحميص",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 1,
    },
  });
  const optLightRoast = await prisma.variationOption.create({
    data: { variationGroupId: ethRoastGroup.id, nameEn: "Light Roast", nameAr: "تحميص فاتح", sortOrder: 1 },
  });
  const optEthMedRoast = await prisma.variationOption.create({
    data: { variationGroupId: ethRoastGroup.id, nameEn: "Medium Roast", nameAr: "تحميص متوسط", sortOrder: 2 },
  });

  const ethGrindGroup = await prisma.variationGroup.create({
    data: {
      itemId: beansEth.id,
      nameEn: "Grind Type",
      nameAr: "نوع الطحن",
      required: true,
      selectionType: "SINGLE",
      sortOrder: 2,
    },
  });
  const optEthWB = await prisma.variationOption.create({
    data: { variationGroupId: ethGrindGroup.id, nameEn: "Whole Beans", nameAr: "حبوب كاملة", sortOrder: 1 },
  });
  const optEthFG = await prisma.variationOption.create({
    data: { variationGroupId: ethGrindGroup.id, nameEn: "Filter Ground", nameAr: "مطحونة فلتر", sortOrder: 2 },
  });

  const ethVariants = [
    { roast: optLightRoast, grind: optEthWB, sku: "ETH-LGT-WB", price: 55.0, stock: 10 },
    { roast: optLightRoast, grind: optEthFG, sku: "ETH-LGT-FG", price: 58.0, stock: 6 },
    { roast: optEthMedRoast, grind: optEthWB, sku: "ETH-MED-WB", price: 55.0, stock: 8 },
    { roast: optEthMedRoast, grind: optEthFG, sku: "ETH-MED-FG", price: 58.0, stock: 6 },
  ];

  for (const ev of ethVariants) {
    await prisma.productVariant.create({
      data: {
        itemId: beansEth.id,
        sku: ev.sku,
        barcode: `6281006${ev.sku.replace(/-/g, "")}`,
        price: ev.price,
        stockQuantity: ev.stock,
        active: true,
        variantOptions: {
          create: [
            { variationGroupId: ethRoastGroup.id, variationOptionId: ev.roast.id },
            { variationGroupId: ethGrindGroup.id, variationOptionId: ev.grind.id },
          ],
        },
      },
    });
  }

  // 11. Initial Past Demo Sales & Invoices
  console.log("Creating past demo transactions...");
  
  // Sale 1: Morning Order (INV-000101)
  const sale1 = await prisma.sale.create({
    data: {
      businessId: business.id,
      userId: staff1.id,
      subtotal: 48.0,
      discountType: "FIXED",
      discountValue: 3.0,
      discountAmount: 3.0,
      taxAmount: 0.0,
      totalAmount: 45.0,
      paymentMethod: "CARD",
      orderType: "TAKEAWAY",
      status: "COMPLETED",
      items: {
        create: [
          {
            itemId: cappuccino.id,
            itemNameEnSnapshot: "Cappuccino (Large 16oz + Oat Milk)",
            itemNameArSnapshot: "كابتشينو (كبير 16 أونصة + حليب شوفان)",
            quantity: 2,
            baseUnitPrice: 14.0,
            variationAmount: 9.0,
            unitPrice: 23.0,
            discountAmount: 0.0,
            lineTotal: 46.0,
            options: {
              create: [
                { variationGroupNameEn: "Size", variationGroupNameAr: "الحجم", optionNameEn: "Large (16oz)", optionNameAr: "كبير (16 أونصة)", priceAdjustment: 5.0 },
                { variationGroupNameEn: "Milk Choice", variationGroupNameAr: "نوع الحليب", optionNameEn: "Oat Milk", optionNameAr: "حليب شوفان", priceAdjustment: 4.0 },
              ],
            },
          },
          {
            itemId: croissant.id,
            itemNameEnSnapshot: "Butter Croissant",
            itemNameArSnapshot: "كرواسون زبدة فرنسي",
            quantity: 1,
            baseUnitPrice: 10.0,
            variationAmount: 0.0,
            unitPrice: 10.0,
            discountAmount: 0.0,
            lineTotal: 10.0,
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
      issueDate: "2026-09-24",
      issueTime: "09:30:15",
      businessNameEn: business.nameEn,
      businessNameAr: business.nameAr,
      businessAddressEn: business.addressEn,
      businessAddressAr: business.addressAr,
      subtotal: 56.0,
      discount: 3.0,
      tax: 0.0,
      totalAmount: 53.0,
      paymentMethod: "CARD",
      status: "ISSUED",
    },
  });

  // Sale 2: Afternoon Order (INV-000102)
  const sale2 = await prisma.sale.create({
    data: {
      businessId: business.id,
      userId: staff2.id,
      subtotal: 38.0,
      discountType: "NONE",
      discountValue: 0.0,
      discountAmount: 0.0,
      taxAmount: 0.0,
      totalAmount: 38.0,
      paymentMethod: "CASH",
      orderType: "DINE_IN",
      status: "COMPLETED",
      items: {
        create: [
          {
            itemId: icedSpanish.id,
            itemNameEnSnapshot: "Iced Spanish Latte (Regular + Normal Ice)",
            itemNameArSnapshot: "سبانش لاتيه بارد (وسط + ثلج عادي)",
            quantity: 2,
            baseUnitPrice: 19.0,
            variationAmount: 0.0,
            unitPrice: 19.0,
            discountAmount: 0.0,
            lineTotal: 38.0,
            options: {
              create: [
                { variationGroupNameEn: "Size", variationGroupNameAr: "الحجم", optionNameEn: "Regular (16oz)", optionNameAr: "وسط (16 أونصة)", priceAdjustment: 0.0 },
                { variationGroupNameEn: "Ice Level", variationGroupNameAr: "مستوى الثلج", optionNameEn: "Normal Ice", optionNameAr: "ثلج عادي", priceAdjustment: 0.0 },
              ],
            },
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
      issueDate: "2026-09-24",
      issueTime: "14:15:40",
      businessNameEn: business.nameEn,
      businessNameAr: business.nameAr,
      businessAddressEn: business.addressEn,
      businessAddressAr: business.addressAr,
      subtotal: 38.0,
      discount: 0.0,
      tax: 0.0,
      totalAmount: 38.0,
      paymentMethod: "CASH",
      status: "ISSUED",
    },
  });

  console.log("✅ SEED COMPLETE! All data populated on Neon PostgreSQL.");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });