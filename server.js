// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { forecastTrends } from './forecast.js'; // Import your forecast module

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// ✅ Allowed origins (adjust for your Netlify + local dev)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://friendly-pasca-4754e6.netlify.app', // ✅ your Netlify URL
];

// ✅ Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ Define Schema
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

// ✅ Routes

// Root route
app.get('/', (req, res) => {
  res.send('Resale Manager API is running...');
});

// GET all items
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
    const newItem = new Item(req.body);
    await newItem.save();
    res.json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add item', details: err.message });
  }
});

// PUT update item
app.put('/api/items/:name', async (req, res) => {
  try {
    const updatedItem = await Item.findOneAndUpdate(
      { name: req.params.name },
      req.body,
      { new: true }
    );
    if (!updatedItem) return res.status(404).json({ error: 'Item not found' });
    res.json(updatedItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item', details: err.message });
  }
});

// DELETE item
app.delete('/api/items/:name', async (req, res) => {
  try {
    const deleted = await Item.findOneAndDelete({ name: req.params.name });
    if (!deleted) return res.status(404).json({ error: 'Item not found' });
    res.json({ success: true, deletedItem: deleted.name });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item', details: err.message });
  }
});

// ✅ Forecast route (connects to forecast.js)
app.get('/api/forecast', async (req, res) => {
  try {
    const forecast = await forecastTrends(7);
    res.json(forecast);
  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
});

// ✅ Start server
app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
