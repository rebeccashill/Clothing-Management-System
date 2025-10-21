// ✅ 1️⃣ Import dependencies
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { forecastTrends } from './forecast.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ 2️⃣ CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://resalemanager.onrender.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);
app.use(express.json());

// ✅ 3️⃣ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ 4️⃣ Define Schema & Model
const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: String,
  brand: String,
  likes: { type: Number, default: 0 },
  origPrice: { type: Number, default: 0 },
  salePrice: { type: Number, default: 0 },
  quantity: { type: Number, default: 1 },
  sold: { type: Number, default: 0 },
  profitPerItem: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  boosted: { type: Boolean, default: false },
  platform: String,
  salesHistory: [
    {
      date: String,
      totalProfit: Number,
    },
  ],
  dateSold: String,
});

const Item = mongoose.model('Item', itemSchema);

// ✅ 5️⃣ API ROUTES — must be defined *before* static serving
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items', details: err.message });
  }
});

// POST new item
app.post('/api/items', async (req, res) => {
  try {
    const { origPrice = 0, salePrice = 0, sold = 0 } = req.body;
    const profitPerItem = Number((salePrice - origPrice).toFixed(2));
    const totalProfit = Number((profitPerItem * sold).toFixed(2));

    const newItem = new Item({
      ...req.body,
      profitPerItem,
      totalProfit,
    });

    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item', details: err.message });
  }
});

// PUT update item
app.put('/api/items/:name', async (req, res) => {
  try {
    const { origPrice = 0, salePrice = 0, sold = 0 } = req.body;
    const profitPerItem = Number((salePrice - origPrice).toFixed(2));
    const totalProfit = Number((profitPerItem * sold).toFixed(2));

    const updatedItem = await Item.findOneAndUpdate(
      { name: req.params.name },
      { ...req.body, profitPerItem, totalProfit },
      { new: true }
    );

    if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item', details: err.message });
  }
});


app.delete('/api/items/:name', async (req, res) => {
  try {
    const deleted = await Item.findOneAndDelete({ name: req.params.name });
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true, deletedItem: deleted.name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item', details: err.message });
  }
});

// ✅ 6️⃣ Serve frontend *after* API routes
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all fallback (only after API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// ✅ 7️⃣ Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
