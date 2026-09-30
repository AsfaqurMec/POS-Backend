const https = require("https");
const fs = require("fs");
const path = require("path");

const productsDir = path.resolve(__dirname, "uploads/products");
const categoriesDir = path.resolve(__dirname, "uploads/categories");

if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir, { recursive: true });
if (!fs.existsSync(categoriesDir)) fs.mkdirSync(categoriesDir, { recursive: true });

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${response.statusCode}`));
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve(dest));
      });
    }).on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

const unsplash = (id) => `https://images.unsplash.com/${id}?w=500&auto=format&fit=crop&q=80`;

const categoryDownloads = [
  { name: "hot-coffee.jpg", url: unsplash("photo-1514432324607-a09d9b4aefdd") },
  { name: "iced-drinks.jpg", url: unsplash("photo-1517256064527-09c73fc73e38") },
  { name: "pour-over.jpg", url: unsplash("photo-1495474472287-4d71bcdd2085") },
  { name: "tea-matcha.jpg", url: unsplash("photo-1536256263959-770b48d82b0a") },
  { name: "refreshers.jpg", url: unsplash("photo-1513558161293-cdaf765ed2fd") },
  { name: "sandwiches.jpg", url: unsplash("photo-1528735602780-2552fd46c7af") },
  { name: "bakery.jpg", url: unsplash("photo-1555507036-ab1f4038808a") },
  { name: "desserts.jpg", url: unsplash("photo-1533134242443-d4fd215305ad") },
  { name: "beans.jpg", url: unsplash("photo-1587734195503-904fca47e0e9") },
];

const productDownloads = [
  // Hot Coffee
  { name: "cappuccino.jpg", url: unsplash("photo-1572442388796-11668a67e53d") },
  { name: "spanish-latte.jpg", url: unsplash("photo-1517701550927-30cf4ba1dba5") },
  { name: "flat-white.jpg", url: unsplash("photo-1577968897966-3d4325b36b61") },
  { name: "americano.jpg", url: unsplash("photo-1514432324607-a09d9b4aefdd") },
  { name: "caramel-macchiato.jpg", url: unsplash("photo-1485808191629-c60a73881472") },
  { name: "cortado.jpg", url: unsplash("photo-1534778101976-62847782c213") },
  { name: "mocha.jpg", url: unsplash("photo-1578314675249-a6910f80cc4e") },

  // Iced Coffee
  { name: "iced-spanish-latte.jpg", url: unsplash("photo-1517256064527-09c73fc73e38") },
  { name: "iced-salted-caramel.jpg", url: unsplash("photo-1461023058943-07fcbe16d735") },
  { name: "iced-americano.jpg", url: unsplash("photo-1517701604599-bb29b565090c") },
  { name: "cold-brew.jpg", url: unsplash("photo-1592663527359-cf6642f54cff") },
  { name: "iced-white-mocha.jpg", url: unsplash("photo-1551024709-8f23befc6f87") },
  { name: "shaken-espresso.jpg", url: unsplash("photo-1541167760496-1628856ab772") },

  // Pour Over
  { name: "v60-ethiopia.jpg", url: unsplash("photo-1495474472287-4d71bcdd2085") },
  { name: "v60-colombia.jpg", url: unsplash("photo-1514432324607-a09d9b4aefdd") },
  { name: "chemex.jpg", url: unsplash("photo-1511920170033-f8396924c348") },

  // Tea & Matcha
  { name: "matcha-iced.jpg", url: unsplash("photo-1536256263959-770b48d82b0a") },
  { name: "matcha-hot.jpg", url: unsplash("photo-1576092768241-dec231879fc3") },
  { name: "earl-grey.jpg", url: unsplash("photo-1544787219-7f47ccb76574") },
  { name: "moroccan-mint.jpg", url: unsplash("photo-1506377247377-2a5b3b417ebb") },

  // Refreshers & Mojitos
  { name: "passionfruit-mojito.jpg", url: unsplash("photo-1513558161293-cdaf765ed2fd") },
  { name: "blueberry-lemonade.jpg", url: unsplash("photo-1534353473418-4cfa6c56fd38") },
  { name: "strawberry-hibiscus.jpg", url: unsplash("photo-1556881286-fc6915169721") },

  // Sandwiches
  { name: "turkey-croissant.jpg", url: unsplash("photo-1528735602780-2552fd46c7af") },
  { name: "halloumi-focaccia.jpg", url: unsplash("photo-1509722747041-616f39b57569") },
  { name: "chicken-panini.jpg", url: unsplash("photo-1528736235302-52922df5c122") },

  // Bakery
  { name: "butter-croissant.jpg", url: unsplash("photo-1555507036-ab1f4038808a") },
  { name: "almond-croissant.jpg", url: unsplash("photo-1509440159596-0249088772ff") },
  { name: "pain-au-chocolat.jpg", url: unsplash("photo-1530610476181-d83430b64dcd") },
  { name: "cinnamon-roll.jpg", url: unsplash("photo-1509365465985-25d11c17e812") },
  { name: "cardamom-bun.jpg", url: unsplash("photo-1586985289688-ca3cf47d3e6e") },

  // Desserts
  { name: "san-sebastian.jpg", url: unsplash("photo-1533134242443-d4fd215305ad") },
  { name: "tiramisu.jpg", url: unsplash("photo-1571877227200-a0d98ea607e9") },
  { name: "lava-cake.jpg", url: unsplash("photo-1606313564200-e75d5e30476c") },
  { name: "carrot-cake.jpg", url: unsplash("photo-1621303837174-89787a7d4729") },

  // Specialty Beans
  { name: "beans-house-blend.jpg", url: unsplash("photo-1587734195503-904fca47e0e9") },
  { name: "beans-yirgacheffe.jpg", url: unsplash("photo-1611854779393-1b2da9d400fe") },
  { name: "beans-geisha.jpg", url: unsplash("photo-1514432324607-a09d9b4aefdd") },
];

async function run() {
  console.log("⬇️ Downloading high-resolution category images...");
  for (const item of categoryDownloads) {
    const dest = path.join(categoriesDir, item.name);
    try {
      await downloadFile(item.url, dest);
      console.log(`✓ Category image: ${item.name}`);
    } catch (e) {
      console.error(`Failed ${item.name}:`, e.message);
    }
  }

  console.log("⬇️ Downloading high-resolution product images...");
  for (const item of productDownloads) {
    const dest = path.join(productsDir, item.name);
    try {
      await downloadFile(item.url, dest);
      console.log(`✓ Product image: ${item.name}`);
    } catch (e) {
      console.error(`Failed ${item.name}:`, e.message);
    }
  }
  console.log("🎉 All exact high-resolution images downloaded successfully!");
}

run();