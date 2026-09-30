const fs = require("fs");
const path = require("path");

function createSvg(bgGradStart, bgGradEnd, iconSvg, title, subtitle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${bgGradStart}"/>
      <stop offset="100%" stop-color="${bgGradEnd}"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.25"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" rx="24" fill="url(#bg)"/>
  <circle cx="200" cy="115" r="54" fill="white" fill-opacity="0.12" />
  <g transform="translate(165, 80) scale(1.4)" filter="url(#shadow)">
    ${iconSvg}
  </g>
  <text x="200" y="210" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="800" fill="#ffffff" letter-spacing="0.5">${title}</text>
  <text x="200" y="235" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#ffffff" fill-opacity="0.8">${subtitle}</text>
</svg>`;
}

// SVG Icons
const cupIcon = `<path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="6" y1="2" x2="6" y2="4" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="2" x2="10" y2="4" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/><line x1="14" y1="2" x2="14" y2="4" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`;
const iceIcon = `<path d="M7 2v20M17 2v20M2 12h20M2 7h20M2 17h20" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round"/>`;
const cakeIcon = `<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8M4 21h16M12 4v7" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
const bagIcon = `<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="3" y1="6" x2="21" y2="6" stroke="#ffffff" stroke-width="2"/><path d="M16 10a4 4 0 0 1-8 0" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>`;
const matchaIcon = `<path d="M12 21a9 9 0 0 0 9-9H3a9 9 0 0 0 9 9Z" fill="none" stroke="#ffffff" stroke-width="2"/><path d="M19 12a7 7 0 0 0-14 0" fill="none" stroke="#ffffff" stroke-width="1.8"/>`;

// Generate Business Logo
const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">
  <defs>
    <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8f633a"/>
      <stop offset="100%" stop-color="#442d1e"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="60" fill="url(#logoBg)"/>
  <circle cx="150" cy="150" r="115" fill="none" stroke="#f3ebe0" stroke-width="4" stroke-dasharray="6 6"/>
  <g transform="translate(120, 105) scale(2.5)">
    <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" fill="none" stroke="#f3ebe0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="6" y1="2" x2="6" y2="4" stroke="#f3ebe0" stroke-width="2" stroke-linecap="round"/>
    <line x1="10" y1="2" x2="10" y2="4" stroke="#f3ebe0" stroke-width="2" stroke-linecap="round"/>
    <line x1="14" y1="2" x2="14" y2="4" stroke="#f3ebe0" stroke-width="2" stroke-linecap="round"/>
  </g>
  <text x="150" y="215" text-anchor="middle" font-family="system-ui, sans-serif" font-size="16" font-weight="900" fill="#f3ebe0" letter-spacing="3">AROMA COFFEE</text>
  <text x="150" y="235" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#c49e72" letter-spacing="1">SPECIALTY ROASTERS</text>
</svg>`;

const uploadsDir = path.resolve(__dirname, "../uploads");
fs.writeFileSync(path.join(uploadsDir, "businesses/logo.svg"), logoSvg);

// Categories
const categories = [
  { file: "hot-coffee.svg", start: "#8f633a", end: "#442d1e", icon: cupIcon, en: "Hot Coffee", ar: "قهوة ساخنة" },
  { file: "iced-drinks.svg", start: "#0284c7", end: "#0369a1", icon: iceIcon, en: "Iced Drinks", ar: "مشروبات باردة" },
  { file: "tea-matcha.svg", start: "#15803d", end: "#166534", icon: matchaIcon, en: "Tea & Matcha", ar: "شاي وماتشا" },
  { file: "bakery.svg", start: "#d97706", end: "#b45309", icon: cakeIcon, en: "Bakery & Sweets", ar: "مخبوزات وحلويات" },
  { file: "beans.svg", start: "#78350f", end: "#451a03", icon: bagIcon, en: "Specialty Beans", ar: "حبوب القهوة" },
];

for (const c of categories) {
  fs.writeFileSync(path.join(uploadsDir, "categories", c.file), createSvg(c.start, c.end, c.icon, c.en, c.ar));
}

// Products
const products = [
  { file: "cappuccino.svg", start: "#8f633a", end: "#5b3c26", icon: cupIcon, en: "Cappuccino", ar: "كابتشينو" },
  { file: "spanish-latte.svg", start: "#a16207", end: "#713f12", icon: cupIcon, en: "Spanish Latte", ar: "سبانش لاتيه" },
  { file: "iced-spanish-latte.svg", start: "#0284c7", end: "#075985", icon: iceIcon, en: "Iced Spanish Latte", ar: "سبانش لاتيه بارد" },
  { file: "americano.svg", start: "#442d1e", end: "#1c1917", icon: cupIcon, en: "Americano", ar: "أمريكانو" },
  { file: "flat-white.svg", start: "#9a3412", end: "#7c2d12", icon: cupIcon, en: "Flat White", ar: "فلات وايت" },
  { file: "iced-salted-caramel.svg", start: "#b45309", end: "#78350f", icon: iceIcon, en: "Iced Salted Caramel", ar: "سولتيد كراميل بارد" },
  { file: "cold-brew.svg", start: "#3f3f46", end: "#18181b", icon: iceIcon, en: "Cold Brew Reserve", ar: "كولد برو كلاسيك" },
  { file: "matcha-latte.svg", start: "#15803d", end: "#14532d", icon: matchaIcon, en: "Iced Matcha Latte", ar: "آيس ماتشا لاتيه" },
  { file: "butter-croissant.svg", start: "#d97706", end: "#92400e", icon: cakeIcon, en: "Butter Croissant", ar: "كرواسون زبدة" },
  { file: "almond-croissant.svg", start: "#b45309", end: "#78350f", icon: cakeIcon, en: "Almond Croissant", ar: "كرواسون لوز" },
  { file: "chocolate-muffin.svg", start: "#442d1e", end: "#271910", icon: cakeIcon, en: "Chocolate Muffin", ar: "مافن شوكولاتة" },
  { file: "cinnamon-roll.svg", start: "#c2410c", end: "#7c2d12", icon: cakeIcon, en: "Pecan Cinnamon Roll", ar: "سينامون رول بيكان" },
  { file: "san-sebastian.svg", start: "#ea580c", end: "#9a3412", icon: cakeIcon, en: "San Sebastian", ar: "سان سباستيان كيك" },
  { file: "beans-house-blend.svg", start: "#78350f", end: "#451a03", icon: bagIcon, en: "Aroma House Blend", ar: "بلند أروما (250g)" },
  { file: "beans-yirgacheffe.svg", start: "#431407", end: "#260e04", icon: bagIcon, en: "Ethiopia Yirgacheffe", ar: "إثيوبيا يرغاتشيفي" },
];

for (const p of products) {
  fs.writeFileSync(path.join(uploadsDir, "products", p.file), createSvg(p.start, p.end, p.icon, p.en, p.ar));
}

console.log(`Generated: Logo, ${categories.length} Category images, and ${products.length} Product images successfully!`);