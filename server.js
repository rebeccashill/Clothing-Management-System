import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;
const staticDir = 'public';

// Enable CORS for all origins (adjust as needed for production)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Accept']
}));
app.use(express.json());

// Set security and caching headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.removeHeader('Content-Security-Policy');
  res.removeHeader('Expires');
  next();
});

// Serve static files with cache-control
app.use('/public', express.static(staticDir, {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
}));

// API endpoints
app.get('/api/items', async (req, res) => {
  try {
    console.log('GET /api/items: Reading inventory.json');
    const data = await fs.readFile(path.join(__dirname, 'inventory.json'), 'utf8');
    const items = JSON.parse(data);
    // Validate data
    const validatedItems = items.map(item => ({
      ...item,
      origPrice: typeof item.origPrice === 'number' ? item.origPrice : 0,
      salePrice: typeof item.salePrice === 'number' ? item.salePrice : 0,
      totalProfit: typeof item.totalProfit === 'number' ? item.totalProfit : 0,
      profitPerItem: typeof item.profitPerItem === 'number' ? item.profitPerItem : 0,
      likes: typeof item.likes === 'number' ? item.likes : 0,
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
      sold: typeof item.sold === 'number' ? item.sold : 0,
      dateSold: item.dateSold || null,
      name: item.name || '',
      type: item.type || '',
      platform: item.platform || '',
      boosted: typeof item.boosted === 'boolean' ? item.boosted : false,
      salesHistory: Array.isArray(item.salesHistory) ? item.salesHistory : []
    }));
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(validatedItems);
  } catch (err) {
    console.error('GET /api/items: Error reading inventory:', err);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).json({ error: 'Failed to read inventory', details: err.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const newItem = req.body;
    console.log('POST /api/items: Received new item:', newItem);
    // Validate new item
    const validatedItem = {
      ...newItem,
      origPrice: typeof newItem.origPrice === 'number' ? newItem.origPrice : 0,
      salePrice: typeof newItem.salePrice === 'number' ? newItem.salePrice : 0,
      totalProfit: typeof newItem.totalProfit === 'number' ? newItem.totalProfit : (newItem.salePrice - newItem.origPrice) * (newItem.sold || 0),
      profitPerItem: typeof newItem.profitPerItem === 'number' ? newItem.profitPerItem : newItem.salePrice - newItem.origPrice,
      likes: typeof newItem.likes === 'number' ? newItem.likes : 0,
      quantity: typeof newItem.quantity === 'number' ? newItem.quantity : 1,
      sold: typeof newItem.sold === 'number' ? newItem.sold : 0,
      dateSold: newItem.dateSold || null,
      name: newItem.name || '',
      type: newItem.type || '',
      platform: newItem.platform || '',
      boosted: typeof newItem.boosted === 'boolean' ? newItem.boosted : false,
      salesHistory: Array.isArray(newItem.salesHistory) ? newItem.salesHistory : []
    };
    const data = await fs.readFile(path.join(__dirname, 'inventory.json'), 'utf8');
    const items = JSON.parse(data);
    items.push(validatedItem);
    await fs.writeFile(path.join(__dirname, 'inventory.json'), JSON.stringify(items, null, 2), 'utf8');
    console.log('POST /api/items: Saved item:', validatedItem);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(validatedItem);
  } catch (err) {
    console.error('POST /api/items: Error adding item:', err);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).json({ error: 'Failed to add item', details: err.message });
  }
});

// Update item (supports both PUT /api/items and PUT /api/items/:name)
app.put(['/api/items', '/api/items/:name'], async (req, res) => {
  try {
    const updatedItem = req.body;
    const nameFromParam = req.params.name;
    console.log('PUT request received:', nameFromParam || updatedItem.name, updatedItem);

    // Read inventory
    const data = await fs.readFile(path.join(__dirname, 'inventory.json'), 'utf8');
    let items = JSON.parse(data);

    // Determine which item to update
    const targetName = nameFromParam || updatedItem.name;
    const index = items.findIndex(item => item.name === targetName);

    if (index === -1) {
      return res.status(404).json({ error: `Item not found: ${targetName}` });
    }

    // Validate and normalize item fields
    const validatedItem = {
      ...items[index],
      ...updatedItem,
      name: updatedItem.name || items[index].name,
      type: updatedItem.type || items[index].type || '',
      platform: updatedItem.platform || items[index].platform || '',
      origPrice: typeof updatedItem.origPrice === 'number' ? updatedItem.origPrice : items[index].origPrice || 0,
      salePrice: typeof updatedItem.salePrice === 'number' ? updatedItem.salePrice : items[index].salePrice || 0,
      profitPerItem: typeof updatedItem.profitPerItem === 'number'
        ? updatedItem.profitPerItem
        : (updatedItem.salePrice ?? items[index].salePrice) - (updatedItem.origPrice ?? items[index].origPrice),
      totalProfit: typeof updatedItem.totalProfit === 'number'
        ? updatedItem.totalProfit
        : ((updatedItem.salePrice ?? items[index].salePrice) - (updatedItem.origPrice ?? items[index].origPrice)) *
          (updatedItem.sold ?? items[index].sold ?? 0),
      likes: typeof updatedItem.likes === 'number' ? updatedItem.likes : items[index].likes || 0,
      quantity: typeof updatedItem.quantity === 'number' ? updatedItem.quantity : items[index].quantity || 1,
      sold: typeof updatedItem.sold === 'number' ? updatedItem.sold : items[index].sold || 0,
      boosted: typeof updatedItem.boosted === 'boolean' ? updatedItem.boosted : items[index].boosted || false,
      salesHistory: Array.isArray(updatedItem.salesHistory)
        ? updatedItem.salesHistory
        : items[index].salesHistory || [],
      // ✅ Add or update Date Sold category
      dateSold: updatedItem.dateSold || items[index].dateSold || null
    };

    // Replace the item and save
    items[index] = validatedItem;
    await fs.writeFile(path.join(__dirname, 'inventory.json'), JSON.stringify(items, null, 2), 'utf8');

    console.log('Updated item saved:', validatedItem);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(validatedItem);

  } catch (err) {
    console.error('PUT /api/items error:', err);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).json({ error: 'Failed to update item', details: err.message });
  }
});

app.delete(['/api/items', '/api/items/:name'], async (req, res) => {
  try {
    const nameFromParam = req.params.name;
    const nameFromBody = req.body?.name;
    const name = nameFromParam || nameFromBody;

    console.log('DELETE request received for item:', name);

    // Validate
    if (!name) {
      console.log('DELETE: Item name is required');
      return res.status(400).json({ error: 'Item name is required' });
    }

    // Read current inventory
    const data = await fs.readFile(path.join(__dirname, 'inventory.json'), 'utf8');
    let items = JSON.parse(data);

    const initialLength = items.length;
    items = items.filter(item => item.name !== name);

    if (items.length === initialLength) {
      console.log(`DELETE: Item not found: ${name}`);
      return res.status(404).json({ error: `Item '${name}' not found` });
    }

    // Write updated file
    await fs.writeFile(path.join(__dirname, 'inventory.json'), JSON.stringify(items, null, 2), 'utf8');

    console.log(`DELETE: Successfully deleted item: ${name}`);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json({ success: true, deletedItem: name });
  } catch (err) {
    console.error('DELETE: Error deleting item:', err);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(500).json({ error: 'Failed to delete item', details: err.message });
  }
});


// Handle unmatched API routes
app.use('/api/*', (req, res) => {
  console.log(`Unmatched API route: ${req.method} ${req.originalUrl}`);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(404).json({ error: `API endpoint not found: ${req.originalUrl}` });
});

// Optional: serve index
app.get('/', (req, res) => {
  console.log('GET /: Serving index.html');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.sendFile(path.join(__dirname, staticDir, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error in ${req.method} ${req.url}:`, err);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});