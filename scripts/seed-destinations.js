// Seed script — run with: node scripts/seed-destinations.js
// Requires the backend server to be running on port 3000
// This script will:
//   1. Register a test user (if not already registered)
//   2. Login to get an auth token
//   3. Seed all destinations using the token

const API_BASE = 'http://localhost:3000/api';

const TEST_USER = {
  name: 'Seed Admin',
  email: 'seed@travelbook.local',
  password: 'seedpass123',
};

const destinations = [
  // 🇲🇦 Moroccan Destinations
  {
    name: 'Marrakech',
    country: 'Maroc',
    city: 'Marrakech',
    description:
      'Explore the vibrant souks, stunning palaces, and the famous Jemaa el-Fnaa square. Marrakech is a feast for the senses with its rich colors, aromas, and culture.',
    image:
      'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&h=400&fit=crop',
    price: 4500,
    rating: 4.8,
  },
  {
    name: 'Chefchaouen',
    country: 'Maroc',
    city: 'Chefchaouen',
    description:
      'The iconic blue pearl of Morocco. Wander through its striking blue-washed streets nestled in the Rif Mountains for a truly unforgettable experience.',
    image:
      'https://images.unsplash.com/photo-1589871973312-9da116fb3e72?w=600&h=400&fit=crop',
    price: 3200,
    rating: 4.7,
  },
  {
    name: 'Fès',
    country: 'Maroc',
    city: 'Fès',
    description:
      'Step back in time in the world\'s largest car-free urban area. Fès is home to ancient tanneries, intricate madrasas, and a medina that feels untouched by centuries.',
    image:
      'https://images.unsplash.com/photo-1604076850742-4c722869f2e3?w=600&h=400&fit=crop',
    price: 2800,
    rating: 4.6,
  },
  {
    name: 'Sahara Desert – Merzouga',
    country: 'Maroc',
    city: 'Merzouga',
    description:
      'Spend a night under the stars in a luxury desert camp. Ride camels over golden dunes and witness the most breathtaking sunsets in the world.',
    image:
      'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=600&h=400&fit=crop',
    price: 5500,
    rating: 4.9,
  },
  // 🌍 Global Destinations
  {
    name: 'Paris',
    country: 'France',
    city: 'Paris',
    description:
      'The City of Light beckons with its iconic Eiffel Tower, world-class museums, charming cafés, and romantic Seine riverbanks.',
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop',
    price: 1299,
    rating: 4.6,
  },
  {
    name: 'Tokyo',
    country: 'Japan',
    city: 'Tokyo',
    description:
      'A mesmerizing blend of ultramodern and traditional. Neon-lit skyscrapers stand alongside ancient temples in this vibrant metropolis.',
    image:
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&h=400&fit=crop',
    price: 1899,
    rating: 4.7,
  },
  {
    name: 'Santorini',
    country: 'Greece',
    city: 'Santorini',
    description:
      'Famous for its stunning white-washed buildings with blue domes, dramatic sunsets, and crystal-clear Aegean waters.',
    image:
      'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&h=400&fit=crop',
    price: 1599,
    rating: 4.8,
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    city: 'Ubud',
    description:
      'Tropical paradise with lush rice terraces, ancient temples, vibrant arts scene, and world-class surfing beaches.',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop',
    price: 899,
    rating: 4.5,
  },
];

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

async function getToken() {
  // Try registering first (fails silently if user already exists)
  await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify(TEST_USER),
  });

  // Login to get a token
  const { ok, data } = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password }),
  });

  if (!ok) {
    throw new Error(`Login failed: ${data.message || JSON.stringify(data)}`);
  }

  console.log(`  🔑 Logged in as ${TEST_USER.email}`);
  return data.token;
}

async function seed() {
  console.log('⏳ Authenticating...\n');

  let token;
  try {
    token = await getToken();
  } catch (err) {
    console.error(`  ❌ Authentication failed: ${err.message}`);
    console.error('  Make sure the server is running on port 3000.');
    process.exit(1);
  }

  console.log(`\n🌍 Seeding ${destinations.length} destinations...\n`);

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  for (const dest of destinations) {
    try {
      const res = await fetch(`${API_BASE}/destinations`, {
        method: 'POST',
        headers,
        body: JSON.stringify(dest),
      });
      if (res.ok) {
        const created = await res.json();
        console.log(`  ✅ ${created.name} (${created.country})`);
      } else {
        const err = await res.json();
        console.log(`  ❌ ${dest.name} — ${err.message || JSON.stringify(err)}`);
      }
    } catch (err) {
      console.log(`  ❌ ${dest.name} — ${err.message}`);
    }
  }

  console.log('\n✨ Done! Refresh the Destinations page.');
}

seed();
