// ============================================================
// Seed Script — TravelBook Database Populator
// ============================================================
//
// Run with:   MONGO_URI="<your_connection_string>" node seed.js
//
// Populates:
//   - Destinations  (8 hand-picked destinations)
//   - Hotels        (sample properties per city)
//
// FAQ Note: FAQ content is stored in the frontend i18n locale files
// (client/src/i18n/locales/*.json), NOT in MongoDB. No FAQ seeding needed.
//
// Idempotent: safe to run multiple times — uses upsert by name.
// ============================================================

const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Try loading .env from project root (two levels up from this file)
const path = require("path");
const fs = require("fs");
const rootEnv = path.resolve(__dirname, "../../.env");
if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv, override: true });
}

// ──────────────────────────────────────────────
// SCHEMAS (matching server models exactly)
// ──────────────────────────────────────────────

const destinationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    country: String,
    city: String,
    description: String,
    image: String,
    price: Number,
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const hotelSchema = new mongoose.Schema({
  name: String,
  city: String,
  price: Number,
});

const Destination = mongoose.model("Destination", destinationSchema);
const Hotel = mongoose.model("Hotel", hotelSchema);

// ──────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────

const destinations = [
  // 🇲🇦 Moroccan Destinations
  {
    name: "Marrakech",
    country: "Maroc",
    city: "Marrakech",
    description:
      "Explore the vibrant souks, stunning palaces, and the famous Jemaa el-Fnaa square. Marrakech is a feast for the senses with its rich colors, aromas, and culture.",
    image:
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&h=400&fit=crop",
    price: 4500,
    rating: 4.8,
  },
  {
    name: "Chefchaouen",
    country: "Maroc",
    city: "Chefchaouen",
    description:
      "The iconic blue pearl of Morocco. Wander through its striking blue-washed streets nestled in the Rif Mountains for a truly unforgettable experience.",
    image:
      "https://images.unsplash.com/photo-1589871973312-9da116fb3e72?w=600&h=400&fit=crop",
    price: 3200,
    rating: 4.7,
  },
  {
    name: "Fès",
    country: "Maroc",
    city: "Fès",
    description:
      "Step back in time in the world's largest car-free urban area. Fès is home to ancient tanneries, intricate madrasas, and a medina that feels untouched by centuries.",
    image:
      "https://images.unsplash.com/photo-1604076850742-4c722869f2e3?w=600&h=400&fit=crop",
    price: 2800,
    rating: 4.6,
  },
  {
    name: "Sahara Desert – Merzouga",
    country: "Maroc",
    city: "Merzouga",
    description:
      "Spend a night under the stars in a luxury desert camp. Ride camels over golden dunes and witness the most breathtaking sunsets in the world.",
    image:
      "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&h=400&fit=crop",
    price: 5500,
    rating: 4.9,
  },
  // 🌍 Global Destinations
  {
    name: "Paris",
    country: "France",
    city: "Paris",
    description:
      "The City of Light beckons with its iconic Eiffel Tower, world-class museums, charming cafés, and romantic Seine riverbanks.",
    image:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop",
    price: 1299,
    rating: 4.6,
  },
  {
    name: "Tokyo",
    country: "Japan",
    city: "Tokyo",
    description:
      "A mesmerizing blend of ultramodern and traditional. Neon-lit skyscrapers stand alongside ancient temples in this vibrant metropolis.",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop",
    price: 1899,
    rating: 4.7,
  },
  {
    name: "Santorini",
    country: "Greece",
    city: "Santorini",
    description:
      "Famous for its stunning white-washed buildings with blue domes, dramatic sunsets, and crystal-clear Aegean waters.",
    image:
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop",
    price: 1599,
    rating: 4.8,
  },
  {
    name: "Bali",
    country: "Indonesia",
    city: "Ubud",
    description:
      "Tropical paradise with lush rice terraces, ancient temples, vibrant arts scene, and world-class surfing beaches.",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop",
    price: 899,
    rating: 4.5,
  },
];

const hotels = [
  // Marrakech
  { name: "La Mamounia", city: "Marrakech", price: 3200 },
  { name: "Royal Mansour", city: "Marrakech", price: 4800 },
  { name: "Riad Fes", city: "Marrakech", price: 1200 },
  // Chefchaouen
  { name: "Dar Echchaouen", city: "Chefchaouen", price: 650 },
  { name: "Hotel Casa Perleta", city: "Chefchaouen", price: 400 },
  // Fès
  { name: "Palais Faraj", city: "Fès", price: 1500 },
  { name: "Riad Laaroussa", city: "Fès", price: 900 },
  // Merzouga
  { name: "Merzouga Luxury Camp", city: "Merzouga", price: 2500 },
  { name: "Kasbah Hotel Tombouctou", city: "Merzouga", price: 800 },
  // Paris
  { name: "Hotel Ritz Paris", city: "Paris", price: 4500 },
  { name: "Mercure Paris Centre", city: "Paris", price: 1200 },
  // Tokyo
  { name: "Park Hyatt Tokyo", city: "Tokyo", price: 3500 },
  { name: "APA Hotel Shinjuku", city: "Tokyo", price: 850 },
  // Santorini
  { name: "Canaves Oia Suites", city: "Santorini", price: 4200 },
  { name: "Santorini Secret Suites", city: "Santorini", price: 2800 },
  // Bali
  { name: "Four Seasons Bali", city: "Ubud", price: 3800 },
  { name: "Mason Elephant Lodge", city: "Ubud", price: 1800 },
];

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────

async function seedCollection(Model, items, keyField) {
  if (!items || items.length === 0) {
    console.log(`  ⏭️  No ${Model.modelName} data to seed`);
    return 0;
  }

  let created = 0;
  let updated = 0;

  for (const item of items) {
    try {
      const filter = { [keyField]: item[keyField] };
      const result = await Model.findOneAndUpdate(filter, { $set: item }, {
        upsert: true,
        new: true,
      });
      // Simple heuristic: if createdAt ≈ updatedAt, it was just created
      const isNew =
        Math.abs(result.createdAt - result.updatedAt) < 100;
      if (isNew) {
        created++;
        console.log(`  ✅ Created ${result.name || result[keyField]}`);
      } else {
        updated++;
        console.log(`  🔄 Updated ${result.name || result[keyField]}`);
      }
    } catch (err) {
      console.log(`  ❌ ${item.name || item[keyField]} — ${err.message}`);
    }
  }

  return { created, updated };
}

// ──────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("");
    console.error("❌ MONGO_URI environment variable is not set.");
    console.error("");
    console.error("   Usage: MONGO_URI=\"<connection_string>\" node seed.js");
    console.error("");
    process.exit(1);
  }

  console.log("⏳ Connecting to MongoDB...");
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 10000,
  });
  console.log("✅ Connected to MongoDB\n");

  // ── Destinations ──
  console.log("🌍 Seeding destinations...\n");
  const destResult = await seedCollection(Destination, destinations, "name");
  console.log(
    `   📊 Total destinations: ${await Destination.countDocuments()} (${destResult.created} new, ${destResult.updated} updated)\n`
  );

  // ── Hotels ──
  console.log("🏨 Seeding hotels...\n");
  const hotelResult = await seedCollection(Hotel, hotels, "name");
  console.log(
    `   📊 Total hotels: ${await Hotel.countDocuments()} (${hotelResult.created} new, ${hotelResult.updated} updated)\n`
  );

  // ── Summary ──
  console.log("═══════════════════════════════════════");
  console.log("✨  Seeding complete!");
  console.log(`   Destinations: ${await Destination.countDocuments()}`);
  console.log(`   Hotels:       ${await Hotel.countDocuments()}`);
  console.log("═══════════════════════════════════════\n");

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB\n");
}

main().catch((err) => {
  console.error("\n❌ Fatal error:", err.message);
  process.exit(1);
});
