const express  = require('express');
const cors     = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const path     = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Root test route
app.get('/', (req, res) => res.json({ status: 'HappyPaws API running', version: '2.0' }));

const MONGO_URI  = process.env.MONGO_URI  || 'mongodb://127.0.0.1:27017';
const DB_NAME    = process.env.DB_NAME    || 'pawmood';
const JWT_SECRET = process.env.JWT_SECRET || 'happypaws_secret_2026';
const PORT       = process.env.PORT       || 5000;

let db;

/* ─── Seed data ─────────────────────────────────────────────────────────── */
const SEED_PRODUCTS = [
  {
    title: 'Whirl Chew Toy',
    description: 'Durable non-toxic rubber chew toy for medium and large dogs. Built to clean teeth while they play.',
    price: 1999, compareAtPrice: 2999, inventory: 120, sku: 'WM-1001',
    tags: ['dog','toy','chew'], rating: 5, reviews: 152, collection: 'Dog Toys',
    images: [
      'https://images.unsplash.com/photo-1555685812-4b943f1d5f75?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Cloud Pet Bed',
    description: 'Soft supportive bed with removable machine-washable cover. Cozy and stylish for all pets.',
    price: 3999, compareAtPrice: 5499, inventory: 65, sku: 'WM-1002',
    tags: ['bed','comfort','sleep'], rating: 5, reviews: 304, collection: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1572980697803-0f6f3810f1a5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Eco Grooming Kit',
    description: 'Complete grooming set with natural brush, shampoo, and nail file. Safe for all breeds.',
    price: 2799, compareAtPrice: 3599, inventory: 80, sku: 'WM-1003',
    tags: ['grooming','care','wellness'], rating: 5, reviews: 198, collection: 'Pet Grooming',
    images: [
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1576201836106-db615e3ff7ac?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Smart Water Bottle',
    description: 'Keep your pet hydrated on the go. Features temperature control and LED indicator.',
    price: 1999, compareAtPrice: 3299, inventory: 95, sku: 'WM-1004',
    tags: ['water','travel','smart'], rating: 5, reviews: 234, collection: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=900&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1555685812-4b943f1d5f75?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Smart Auto Feeder',
    description: 'Automated feeder with scheduling app to keep your pet fed on time, every time.',
    price: 6499, compareAtPrice: 8299, inventory: 70, sku: 'WM-1005',
    tags: ['feeder','smart','food'], rating: 4, reviews: 89, collection: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1514385308-9f669e19bbbe?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Premium Dog Collar',
    description: 'Adjustable leather collar with quick-release buckle. Stylish and durable.',
    price: 1499, compareAtPrice: 2299, inventory: 150, sku: 'WM-1006',
    tags: ['collar','dog','accessories'], rating: 4, reviews: 55, collection: 'Dog Toys',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&q=80',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1555685812-4b943f1d5f75?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Cat Scratching Post',
    description: 'Tall sisal scratching post with cozy top perch. Keeps cats active and furniture safe.',
    price: 2499, compareAtPrice: 3499, inventory: 90, sku: 'WM-1007',
    tags: ['cat','scratching','play'], rating: 5, reviews: 112, collection: 'Cat Essentials',
    images: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1576201836106-db615e3ff7ac?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Pet Carrier Bag',
    description: 'Lightweight breathable carrier bag for cats and small dogs. Airline approved.',
    price: 3299, compareAtPrice: 4499, inventory: 60, sku: 'WM-1008',
    tags: ['carrier','travel','cat','dog'], rating: 4, reviews: 78, collection: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Dog Fetch Ball Set',
    description: 'Set of 3 high-bounce rubber balls in different sizes. Perfect for fetch and outdoor play.',
    price: 999, compareAtPrice: 1599, inventory: 200, sku: 'WM-1009',
    tags: ['dog','toy','fetch','outdoor'], rating: 5, reviews: 210, collection: 'Dog Toys',
    images: [
      'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1555685812-4b943f1d5f75?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Cat Feather Wand',
    description: 'Interactive feather wand toy to keep your cat entertained for hours. Extendable handle.',
    price: 799, compareAtPrice: 1299, inventory: 180, sku: 'WM-1010',
    tags: ['cat','toy','interactive'], rating: 5, reviews: 167, collection: 'Cat Essentials',
    images: [
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1576201836106-db615e3ff7ac?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Orthopedic Dog Mattress',
    description: 'Memory foam orthopedic mattress for senior dogs and large breeds. Relieves joint pain.',
    price: 5499, compareAtPrice: 7499, inventory: 40, sku: 'WM-1011',
    tags: ['dog','bed','orthopedic','senior'], rating: 5, reviews: 93, collection: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1572980697803-0f6f3810f1a5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Pet Shampoo & Conditioner',
    description: 'Natural oatmeal-based shampoo and conditioner combo. Gentle on sensitive skin.',
    price: 1299, compareAtPrice: 1899, inventory: 110, sku: 'WM-1012',
    tags: ['grooming','shampoo','cat','dog'], rating: 4, reviews: 144, collection: 'Pet Grooming',
    images: [
      'https://images.unsplash.com/photo-1576201836106-db615e3ff7ac?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Retractable Dog Leash',
    description: '5-metre retractable leash with anti-slip grip and one-button brake. Suitable up to 25kg.',
    price: 1799, compareAtPrice: 2599, inventory: 130, sku: 'WM-1013',
    tags: ['dog','leash','walk','outdoor'], rating: 4, reviews: 88, collection: 'Dog Toys',
    images: [
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1555685812-4b943f1d5f75?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Cat Litter Box with Hood',
    description: 'Enclosed litter box with carbon filter and easy-clean tray. Odour-free design.',
    price: 2199, compareAtPrice: 3199, inventory: 75, sku: 'WM-1014',
    tags: ['cat','litter','hygiene'], rating: 4, reviews: 62, collection: 'Cat Essentials',
    images: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1576201836106-db615e3ff7ac?auto=format&fit=crop&w=600&q=80'
    ]
  },
  {
    title: 'Stainless Steel Bowl Set',
    description: 'Set of 2 anti-skid stainless steel bowls for food and water. Dishwasher safe.',
    price: 899, compareAtPrice: 1399, inventory: 250, sku: 'WM-1015',
    tags: ['bowl','food','water','dog','cat'], rating: 5, reviews: 320, collection: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=900&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1555685812-4b943f1d5f75?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&q=80'
    ]
  },
  {
    title: 'GPS Pet Tracker',
    description: 'Real-time GPS tracker with live location, activity monitor, and waterproof design.',
    price: 4999, compareAtPrice: 6999, inventory: 45, sku: 'WM-1016',
    tags: ['gps','tracker','smart','safety'], rating: 4, reviews: 57, collection: 'Accessories',
    images: [
      'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=900&q=80',
      'https://images.unsplash.com/photo-1514385308-9f669e19bbbe?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1601758124510-52d02ddb7cbd?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=600&q=80'
    ]
  }
];

const SEED_COLLECTIONS = [
  { name: 'Dog Toys',      description: 'Best dog toys for chewing, fetching, and training.',    image: 'https://images.unsplash.com/photo-1555685812-4b943f1d5f75?auto=format&fit=crop&w=600&q=80' },
  { name: 'Pet Grooming',  description: 'Top grooming tools and self-care items for pets.',       image: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=600&q=80' },
  { name: 'Accessories',   description: 'Stylish beds, collars, bottles and travel essentials.',  image: 'https://images.unsplash.com/photo-1572980697803-0f6f3810f1a5?auto=format&fit=crop&w=600&q=80' },
  { name: 'Cat Essentials', description: 'Everything your cat needs — toys, litter, and more.',  image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80' }
];

/* ─── DB connect & seed ─────────────────────────────────────────────────── */
async function connectMongo() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('Connected to MongoDB:', DB_NAME);

  // Seed products
  const products = db.collection('products');
  if ((await products.countDocuments()) === 0) {
    await products.insertMany(SEED_PRODUCTS);
    console.log('Seeded products');
  }

  // Seed collections
  const collections = db.collection('collections');
  if ((await collections.countDocuments()) === 0) {
    await collections.insertMany(SEED_COLLECTIONS);
    console.log('Seeded collections');
  }

  // Ensure cart doc exists
  const cart = db.collection('cart');
  if ((await cart.countDocuments()) === 0) {
    await cart.insertOne({ items: [] });
  }

  // Unique index on users.email
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
}

/* ─── Auth middleware ───────────────────────────────────────────────────── */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: 'No token provided' });
  const token = header.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

/* ─── Auth routes ───────────────────────────────────────────────────────── */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const users = db.collection('users');
    if (await users.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await users.insertOne({
      name, email: email.toLowerCase(), password: hashed, createdAt: new Date()
    });

    const user = { id: result.insertedId, name, email: email.toLowerCase() };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user, token, message: 'Account created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to create account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const users = db.collection('users');
    const user = await users.findOne({ email: email.toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    const payload = { id: user._id, name: user.name, email: user.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: payload, token, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Unable to login' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await db.collection('users').findOne(
    { _id: new ObjectId(req.user.id) },
    { projection: { password: 0 } }
  );
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

/* ─── Products routes ───────────────────────────────────────────────────── */
app.get('/api/products', async (req, res) => {
  try {
    const { collection, search, sort, minPrice, maxPrice } = req.query;
    const filter = {};
    if (collection && collection !== 'all') filter.collection = collection;
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    let cursor = db.collection('products').find(filter);
    if (sort === 'price-low')  cursor = cursor.sort({ price: 1 });
    if (sort === 'price-high') cursor = cursor.sort({ price: -1 });
    if (sort === 'rating')     cursor = cursor.sort({ rating: -1 });
    if (sort === 'newest')     cursor = cursor.sort({ createdAt: -1 });

    const products = await cursor.toArray();
    res.json(products);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Unable to load products' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.collection('products').findOne({ _id: new ObjectId(req.params.id) });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (e) {
    res.status(400).json({ message: 'Invalid product ID' });
  }
});

/* ─── Collections routes ────────────────────────────────────────────────── */
app.get('/api/collections', async (req, res) => {
  try {
    const cols = await db.collection('collections').find().toArray();
    res.json(cols);
  } catch (e) {
    res.status(500).json({ message: 'Unable to load collections' });
  }
});

/* ─── Cart routes ───────────────────────────────────────────────────────── */
app.get('/api/cart', async (req, res) => {
  try {
    const cart = await db.collection('cart').findOne();
    res.json(cart || { items: [] });
  } catch (e) {
    res.status(500).json({ message: 'Unable to load cart' });
  }
});

app.post('/api/cart/add', async (req, res) => {
  try {
    const { productId, qty = 1 } = req.body;
    const pidStr = String(productId);
    const p = await db.collection('products').findOne({ _id: new ObjectId(pidStr) });
    if (!p) return res.status(404).json({ message: 'Product not found' });

    let cart = await db.collection('cart').findOne();
    if (!cart) {
      await db.collection('cart').insertOne({ items: [] });
      cart = await db.collection('cart').findOne();
    }

    const existing = cart.items.find(i => String(i.productId) === pidStr);
    if (existing) {
      existing.qty += Number(qty);
    } else {
      cart.items.push({
        productId: pidStr,
        qty: Number(qty),
        title: p.title,
        price: p.price,
        image: Array.isArray(p.images) ? p.images[0] : (p.image || '')
      });
    }

    await db.collection('cart').updateOne({ _id: cart._id }, { $set: { items: cart.items } });
    res.json(cart);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Unable to add to cart' });
  }
});

app.put('/api/cart', async (req, res) => {
  try {
    const items = req.body.items || [];
    // Ensure all items have string productId
    const cleanItems = items.map(function(i) {
      return {
        productId: String(i.productId),
        qty: Number(i.qty) || 1,
        title: i.title || '',
        price: Number(i.price) || 0,
        image: i.image || ''
      };
    });
    const cart = await db.collection('cart').findOne();
    if (cart) {
      await db.collection('cart').updateOne({ _id: cart._id }, { $set: { items: cleanItems } });
    } else {
      await db.collection('cart').insertOne({ items: cleanItems });
    }
    res.json({ success: true, items: cleanItems });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Unable to update cart' });
  }
});

app.delete('/api/cart/:productId', async (req, res) => {
  try {
    const cart = await db.collection('cart').findOne();
    cart.items = cart.items.filter(i => i.productId !== req.params.productId);
    await db.collection('cart').updateOne({ _id: cart._id }, { $set: { items: cart.items } });
    res.json(cart);
  } catch (e) {
    res.status(500).json({ message: 'Unable to remove item' });
  }
});

/* ─── Orders routes ─────────────────────────────────────────────────────── */
app.post('/api/orders', async (req, res) => {
  try {
    const order = {
      ...req.body,
      status: 'confirmed',
      createdAt: new Date(),
      orderNumber: 'HP-' + Date.now()
    };
    const result = await db.collection('orders').insertOne(order);
    // Clear cart after order
    const cart = await db.collection('cart').findOne();
    if (cart) await db.collection('cart').updateOne({ _id: cart._id }, { $set: { items: [] } });
    res.status(201).json({ ...order, _id: result.insertedId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Unable to place order' });
  }
});

app.get('/api/orders/latest', async (req, res) => {
  try {
    const order = await db.collection('orders').findOne({}, { sort: { createdAt: -1 } });
    if (!order) return res.status(404).json({ message: 'No orders found' });
    res.json(order);
  } catch (e) {
    res.status(500).json({ message: 'Unable to fetch order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { email, userId } = req.query;
    let filter = {};
    if (email && userId) {
      filter = { $or: [{ email: email.toLowerCase() }, { userId: userId }] };
    } else if (email) {
      filter = { email: email.toLowerCase() };
    } else if (userId) {
      filter = { userId: userId };
    }
    const orders = await db.collection('orders')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: 'Unable to fetch orders' });
  }
});

/* ─── Re-seed endpoint (dev only) ──────────────────────────────────────── */
app.post('/api/admin/reseed', async (req, res) => {
  try {
    await db.collection('products').drop().catch(() => {});
    await db.collection('collections').drop().catch(() => {});
    await db.collection('products').insertMany(SEED_PRODUCTS);
    await db.collection('collections').insertMany(SEED_COLLECTIONS);
    res.json({ message: 'Re-seeded successfully', products: SEED_PRODUCTS.length });
  } catch (e) {
    res.status(500).json({ message: 'Re-seed failed', error: e.message });
  }
});

/* ─── Static frontend ───────────────────────────────────────────────────── */
app.use('/frontend', express.static(path.join(__dirname, '..', 'Frontend')));

/* ─── Health check ──────────────────────────────────────────────────────── */
app.get('/api/health', (req, res) => res.json({ status: 'ok', db: DB_NAME }));

/* ─── Start ─────────────────────────────────────────────────────────────── */
// Listen first, then connect to MongoDB
const server = app.listen(PORT, () => {
  console.log('HappyPaws backend running on port ' + PORT);
});

connectMongo()
  .then(() => console.log('MongoDB ready'))
  .catch(err => console.error('MongoDB connection failed:', err.message));
