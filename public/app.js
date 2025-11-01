window.onload = () => {
  console.log("DOM loaded, bootstrapping Clothing Inventory app...");
  const API_URL = "https://resalemanager.onrender.com";

  // ProfitChart Component
    function ProfitChart({ data, title, type, colors }) {
      const canvasRef = React.useRef(null);
      React.useEffect(() => {
        const ctx = canvasRef.current.getContext('2d');
        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: data.map(item => item[type]),
            datasets: [{
              label: `Profit by ${title}`,
              data: data.map(item => item.profit),
              backgroundColor: colors.background,
              borderColor: colors.border,
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'Profit ($)' } },
              x: { title: { display: true, text: title } }
            }
          }
        });
        return () => chart.destroy();
      }, [data, title, type, colors]);
      return (
        <div className="chart-container">
          <h3>Profit by {title}</h3>
          <canvas ref={canvasRef}></canvas>
        </div>
      );
    }

    // ItemList Component
 function ItemList({ items, onEdit, onDelete }) {
  return (
    <div className="item-grid">
      {items.map(item => {
        // Get latest sale date
        const latestSaleDate =
          item.salesHistory && item.salesHistory.length > 0
            ? item.salesHistory[item.salesHistory.length - 1].date
            : null;

        return (
          <div key={item.name} className="item-card">
            <h3>{item.name}</h3>
            <h4>{item.brand || 'Unknown'}</h4>
            <p>Type: {item.type}</p>
            <p>Platform: {item.platform}</p>
            <p>Likes: {item.likes}</p>
            <p>
              Original Price: $
              {(typeof item.origPrice === 'number' ? item.origPrice : 0).toFixed(2)}
            </p>
            <p>
              Sale Price: $
              {(typeof item.salePrice === 'number' ? item.salePrice : 0).toFixed(2)}
            </p>
            <p>
              Profit/Item: $
              {(typeof item.profitPerItem === 'number' ? item.profitPerItem : 0).toFixed(2)}
            </p>
            <p>
              Total Profit: $
              {(typeof item.totalProfit === 'number' ? item.totalProfit : 0).toFixed(2)}
            </p>
            
            {/* Display latest sale date */}
            {/*<p>Date Sold: {latestSaleDate || '—'}</p>*/}
            <p>Date Sold:{' '} {latestSaleDate ? new Date(latestSaleDate).toLocaleDateString(): 'Not sold yet'}
            </p>


            {/* Optional: display all sale dates
            {item.salesHistory && item.salesHistory.length > 0 && (
              <div>
                {item.salesHistory.map((sale, idx) => (
                  <p key={idx}>Sale {idx + 1}: {sale.dateSold}</p>
                ))}
              </div>
            )} */}

            <div className="button-group">
              <button type="button" className="edit-button" onClick={() => onEdit(item)}>
                Edit
              </button>
              <button type="button"
                className="delete-button"
                onClick={() => {
                  console.log('Delete button clicked for item:', item.name);
                  onDelete(item);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}


    // ItemForm Component
    function ItemForm({ item, onSave, onCancel }) {
      const [formData, setFormData] = React.useState({
        name: item ? item.name : '',
        type: item ? item.type : '',
        brand: item ? item.brand : '',
        likes: item ? item.likes : 0,
        origPrice: item ? item.origPrice : 0,
        salePrice: item ? item.salePrice : 0,
        quantity: item ? item.quantity : 1,
        sold: item ? item.sold : 0,
        platform: item ? item.platform : '',
        boosted: item ? item.boosted : false,
        dateSold: item ? item.dateSold : ''
      });

      const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
          ...prev,
          [name]: type === 'checkbox' ? checked : name === 'origPrice' || name === 'salePrice' || name === 'likes' || name === 'quantity' || name === 'sold' ? (value === '' ? 0 : Number(value)) : value
        }));
      };

      const handleSubmit = (e) => {
        e.preventDefault();
        const profitPerItem = Number((formData.salePrice - formData.origPrice).toFixed(3));
        const totalProfit = Number((profitPerItem * formData.sold).toFixed(3));
        const itemToSave = {
          ...formData,
          origPrice: Number(formData.origPrice) || 0,
          salePrice: Number(formData.salePrice) || 0,
          quantity: Number(formData.quantity) || 1,
          sold: Number(formData.sold) || 0,
          likes: Number(formData.likes) || 0,
          profitPerItem,
          totalProfit,
          dateSold: formData.dateSold || null,
          salesHistory: item && Array.isArray(item.salesHistory) ? item.salesHistory : []
        };
        console.log('Submitting item:', itemToSave);
        onSave(itemToSave);
      };

    return (
        <div className="modal">
    <div className="modal-content">
      <h2>{item ? 'Edit Item' : 'Add New Item'}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <label htmlFor="type">Type</label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
        >
          <option value="">Select Type</option>
          <option value="Skirt">Skirt</option>
          <option value="Dress">Dress</option>
          <option value="Sweatshirt">Sweatshirt</option>
          <option value="Bag">Bag</option>
          <option value="Pants">Pants</option>
          <option value="Camisole">Camisole</option>
          <option value="Shirt">Shirt</option>
          <option value="Jacket">Jacket</option>
        </select>

        <label htmlFor="brand">Brand</label>
        <input
          id="brand"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
        />

        <label htmlFor="likes">Likes</label>
        <input
          id="likes"
          name="likes"
          type="number"
          value={formData.likes}
          onChange={handleChange}
          min="0"
        />

        <label htmlFor="origPrice">Original Price</label>
        <input
          id="origPrice"
          name="origPrice"
          type="number"
          step="0.01"
          value={formData.origPrice}
          onChange={handleChange}
          min="0"
          required
        />

        <label htmlFor="salePrice">Sale Price</label>
        <input
          id="salePrice"
          name="salePrice"
          type="number"
          step="0.01"
          value={formData.salePrice}
          onChange={handleChange}
          min="0"
          required
        />

        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
        />

        <label htmlFor="sold">Sold</label>
        <input
          id="sold"
          name="sold"
          type="number"
          value={formData.sold}
          onChange={handleChange}
          min="0"
        />

        <label htmlFor="platform">Platform</label>
        <select
          id="platform"
          name="platform"
          value={formData.platform}
          onChange={handleChange}
          required
        >
          <option value="">Select Platform</option>
          <option value="Depop">Depop</option>
          <option value="Poshmark">Poshmark</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="boosted">
          <input
            id="boosted"
            name="boosted"
            type="checkbox"
            checked={formData.boosted}
            onChange={handleChange}
          />
          Boosted
        </label>

        {/* Date Sold Field */}
        <label htmlFor="dateSold">Date Sold</label>
        <input
          id="dateSold"
          name="dateSold"
          type="date"
          value={formData.dateSold || ''}
          onChange={handleChange}
        />

        <div className="modal-buttons">
          <button type="submit" className="save-button">Save</button>
          <button type="button" className="cancel-button" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  </div>
); }

// FilterSortControls Component
function FilterSortControls({ platformFilter, setPlatformFilter, brandFilter, setBrandFilter, sortBy, setSortBy, brands }) {
  return (
    <div className="filter-sort-controls">
      
      {/* Platform Filter */}
      <div>
<label>
  Filter by Platform
  <select
    value={platformFilter}
    onChange={(e) => setPlatformFilter(e.target.value)}
    name="platformFilter"
  >
    <option value="All">All</option>
    <option value="Depop">Depop</option>
    <option value="Poshmark">Poshmark</option>
    <option value="Other">Other</option>
  </select>
</label>
      </div>

      {/* Brand Filter */}
      <div>
        <label htmlFor="brandFilter">Filter by Brand</label>
        <select
          id="brandFilter"
          name="brandFilter"
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          aria-label="Filter by Brand"
        >
          <option value="All">All</option>
          {brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label htmlFor="sortBy">Sort By</label>
        <select
          id="sortBy"
          name="sortBy"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort By"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="profit-asc">Profit (Low to High)</option>
          <option value="profit-desc">Profit (High to Low)</option>
          <option value="dateSold-asc">Date Sold (Old to New)</option>
          <option value="dateSold-desc">Date Sold (New to Old)</option>
        </select>
      </div>

    </div>
  );
}

  const { useState, useEffect } = React;

  function App() {
    console.log("App started");
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      console.log("Fetching items from backend...");
      fetch(API_URL + "/api/items")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch items");
          return res.json();
        })
        .then((data) => {
          console.log("Items loaded:", data.length);
          setItems(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Fetch error:", err);
          setError(err.message);
          setLoading(false);
        });
    }, []);

    if (loading) return <div className="loading-message">Loading inventory...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
      <div>
        <h1>Clothing Inventory</h1>
        <p>Total items: {items.length}</p>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {items.map((item) => (
            <li key={item._id || item.name}>
              {item.name} - {"$" + (item.totalProfit || 0)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
};