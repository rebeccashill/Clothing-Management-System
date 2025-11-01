window.onload = () => {
  console.log("✅ Clothing Inventory App Loading...");
  const API_URL = "https://resalemanager.onrender.com";
  const { useState, useEffect } = React;

  // ✅ ProfitChart Component
  function ProfitChart({ data, title, groupBy }) {
    const canvasRef = React.useRef(null);

    const grouped = data.reduce((acc, item) => {
      const key = item[groupBy] || "Other";
      acc[key] = (acc[key] || 0) + (item.totalProfit || 0);
      return acc;
    }, {});
    const labels = Object.keys(grouped);
    const profits = Object.values(grouped);

    React.useEffect(() => {
      const ctx = canvasRef.current.getContext("2d");
      const chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: `Profit by ${title}`,
              data: profits,
              backgroundColor: "#007bff40",
              borderColor: "#007bff",
              borderWidth: 1.5,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "Profit ($)" } },
          },
        },
      });
      return () => chart.destroy();
    }, [data]);

    return (
      <div className="chart-container">
        <h3>{`Profit by ${title}`}</h3>
        <canvas ref={canvasRef}></canvas>
      </div>
    );
  }

  // ✅ ItemList
  function ItemList({ items, onEdit, onDelete }) {
    return (
      <div className="item-grid">
        {items.map((item) => {
          const latestSaleDate =
            item.dateSold ||
            (item.salesHistory?.length > 0
              ? item.salesHistory[item.salesHistory.length - 1].date
              : null);
          return (
            <div key={item._id || item.name} className="item-card">
              <h3>{item.name}</h3>
              <h4>{item.brand || "Unknown"}</h4>
              <p>Type: {item.type}</p>
              <p>Platform: {item.platform}</p>
              <p>Likes: {item.likes}</p>
              <p>Original Price: ${item.origPrice?.toFixed(2)}</p>
              <p>Sale Price: ${item.salePrice?.toFixed(2)}</p>
              <p>Profit/Item: ${item.profitPerItem?.toFixed(2)}</p>
              <p>Total Profit: ${item.totalProfit?.toFixed(2)}</p>
              <p>
                Date Sold:{" "}
                {latestSaleDate
                  ? new Date(latestSaleDate).toLocaleDateString()
                  : "Not sold yet"}
              </p>
              <div className="button-group">
                <button className="edit-button" onClick={() => onEdit(item)}>
                  Edit
                </button>
                <button className="delete-button" onClick={() => onDelete(item)}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ✅ ItemForm Modal
  function ItemForm({ item, onSave, onCancel }) {
    const [formData, setFormData] = useState({
      name: item?.name || "",
      type: item?.type || "",
      brand: item?.brand || "",
      likes: item?.likes || 0,
      origPrice: item?.origPrice || 0,
      salePrice: item?.salePrice || 0,
      quantity: item?.quantity || 1,
      sold: item?.sold || 0,
      platform: item?.platform || "",
      boosted: item?.boosted || false,
      dateSold: item?.dateSold || "",
    });

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : ["origPrice", "salePrice", "likes", "quantity", "sold"].includes(name)
            ? Number(value) || 0
            : value,
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      const profitPerItem = formData.salePrice - formData.origPrice;
      const totalProfit = profitPerItem * formData.sold;
      onSave({
        ...formData,
        profitPerItem,
        totalProfit,
      });
    };

    return (
      <div className="modal">
        <div className="modal-content">
          <h2>{item ? "Edit Item" : "Add New Item"}</h2>
          <form onSubmit={handleSubmit}>
            <label>Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required />
            <label>Type</label>
            <input name="type" value={formData.type} onChange={handleChange} />
            <label>Brand</label>
            <input name="brand" value={formData.brand} onChange={handleChange} />
            <label>Platform</label>
            <select name="platform" value={formData.platform} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Depop">Depop</option>
              <option value="Poshmark">Poshmark</option>
              <option value="Other">Other</option>
            </select>
            <label>Likes</label>
            <input type="number" name="likes" value={formData.likes} onChange={handleChange} />
            <label>Original Price</label>
            <input type="number" name="origPrice" step="0.01" value={formData.origPrice} onChange={handleChange} />
            <label>Sale Price</label>
            <input type="number" name="salePrice" step="0.01" value={formData.salePrice} onChange={handleChange} />
            <label>Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} />
            <label>Sold</label>
            <input type="number" name="sold" value={formData.sold} onChange={handleChange} />
            <label>Date Sold</label>
            <input type="date" name="dateSold" value={formData.dateSold} onChange={handleChange} />

            <div className="modal-buttons">
              <button type="submit" className="save-button">
                Save
              </button>
              <button type="button" className="cancel-button" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ✅ App Component
  function App() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
      fetch(API_URL + "/api/items")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch items");
          return res.json();
        })
        .then((data) => {
          setItems(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
          setLoading(false);
        });
    }, []);

    const handleSave = async (item) => {
      const method = editingItem ? "PUT" : "POST";
      const id = editingItem?._id || editingItem?.name;
      const url = editingItem
        ? `${API_URL}/api/items/${encodeURIComponent(id)}`
        : `${API_URL}/api/items`;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });

      if (res.ok) {
        const saved = await res.json();
        if (editingItem) {
          setItems(items.map((i) => (i._id === editingItem._id ? saved : i)));
        } else {
          setItems([...items, saved]);
        }
      }
      setShowModal(false);
      setEditingItem(null);
    };

    const handleDelete = async (item) => {
      if (!confirm(`Delete "${item.name}"?`)) return;
      const res = await fetch(`${API_URL}/api/items/${encodeURIComponent(item._id || item.name)}`, {
        method: "DELETE",
      });
      if (res.ok) setItems(items.filter((i) => i._id !== item._id));
    };

    const totalProfit = items.reduce((sum, i) => sum + (i.totalProfit || 0), 0);

    if (loading) return <div className="loading-message">Loading inventory...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    return (
      <div className="app-container">
        <h1>🧾 Clothing Inventory</h1>
        <div className="total-profit">Total Profit: ${totalProfit.toFixed(2)}</div>

        <ProfitChart data={items} title="Platform" groupBy="platform" />
        <ProfitChart data={items} title="Brand" groupBy="brand" />

        <button className="add-button" onClick={() => setShowModal(true)}>
          + Add Item
        </button>

        <ItemList
          items={items}
          onEdit={(item) => {
            setEditingItem(item);
            setShowModal(true);
          }}
          onDelete={handleDelete}
        />

        {showModal && (
          <ItemForm
            item={editingItem}
            onSave={handleSave}
            onCancel={() => {
              setEditingItem(null);
              setShowModal(false);
            }}
          />
        )}
      </div>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
};
