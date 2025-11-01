window.onload = () => {
  console.log("✅ Clothing Inventory App Booting...");
  const API_URL = "https://resalemanager.onrender.com";
  const { useState, useEffect } = React;

  // ✅ ProfitChart Component
function ProfitChart({ data, title, groupBy }) {
  const canvasRef = React.useRef(null);

  // 1️⃣ Group profits by key (brand, platform, etc.)
  const grouped = data.reduce((acc, item) => {
    const key = item[groupBy] || "Other";
    acc[key] = (acc[key] || 0) + (item.totalProfit || 0);
    return acc;
  }, {});

  // 2️⃣ Sort by profit (descending)
  const sortedEntries = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  const labels = sortedEntries.map(([key]) => key);
  const profits = sortedEntries.map(([, value]) => value);

  // 3️⃣ Render chart
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
          x: { title: { display: true, text: title } },
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
    if (items.length === 0)
      return <p style={{ textAlign: "center", color: "#777" }}>No items found.</p>;

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
              <p>Condition: {item.nwt ? "🆕 New With Tags" : "Preowned"}</p>
              <p>Likes: {item.likes}</p>
              <p>Original Price: ${item.origPrice?.toFixed(2)}</p>
              <p>Sale Price: ${item.salePrice?.toFixed(2)}</p>
              <p>Profit/Item: ${item.profitPerItem?.toFixed(2)}</p>
              <p>Total Profit: ${item.totalProfit?.toFixed(2)}</p>
              <p>
                Date Sold:{" "}
                {latestSaleDate
                    ? (() => {
                        const [y, m, d] = latestSaleDate.split("-");
                        if (!y || !m || !d) return "Invalid date";
                        const months = [
                        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                        ];
                        return `${months[Number(m) - 1]} ${Number(d)}, ${y}`;
                    })()
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

  // ✅ Filter & Sort Controls
  function FilterSortControls({
    platformFilter,
    setPlatformFilter,
    brandFilter,
    setBrandFilter,
    sortBy,
    setSortBy,
    allBrands,
    search,
    setSearch,
    monthFilter,
    setMonthFilter
  }) {
    return (
      <div className="filter-sort-controls">
        <div>
          <label>Platform</label>
            <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Depop">Depop</option>
            <option value="Poshmark">Poshmark</option>
            <option value="Vinted">Vinted</option>
            <option value="eBay">eBay</option>
            <option value="Other">Other</option>
            </select>
        </div>

        <div>
          <label>Brand</label>
          <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
            <option value="All">All</option>
            {allBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="profit-desc">Profit (High → Low)</option>
            <option value="profit-asc">Profit (Low → High)</option>
            <option value="dateSold-desc">Date Sold (New → Old)</option>
            <option value="dateSold-asc">Date Sold (Old → New)</option>
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by name or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div>
        <label htmlFor="monthFilter">Filter by Month Sold</label>
        <select
            id="monthFilter"
            name="monthFilter"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
        >
            <option value="All">All Months</option>
            <option value="1">January</option>
            <option value="2">February</option>
            <option value="3">March</option>
            <option value="4">April</option>
            <option value="5">May</option>
            <option value="6">June</option>
            <option value="7">July</option>
            <option value="8">August</option>
            <option value="9">September</option>
            <option value="10">October</option>
            <option value="11">November</option>
            <option value="12">December</option>
        </select>
        </div>
      </div>
    );
  }

  // ✅ ItemForm (modal)
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
      nwt: item?.nwt || false,
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

    // ✅ Normalize dateSold safely (no timezone conversion)
    let adjustedDateSold = null;
    if (formData.dateSold) {
        // Keep only the local YYYY-MM-DD string
        const [year, month, day] = formData.dateSold.split("-");
        adjustedDateSold = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        0, 0, 0
        ).toISOString(); // force consistent UTC midnight
        adjustedDateSold = formData.dateSold;
    }

    const profitPerItem = formData.salePrice - formData.origPrice;
    const totalProfit = profitPerItem * formData.sold;

    onSave({
        ...formData,
        dateSold: adjustedDateSold,
        profitPerItem,
        totalProfit,
    });
    };


    return (
      <div className="modal">
        <div className="modal-content">
          <h2>{item ? "Edit Item" : "Add New Item"}</h2>
          <form onSubmit={handleSubmit}>
            {[
              ["name", "Name"],
              ["type", "Type"],
              ["brand", "Brand"],
              ["platform", "Platform"],
              ["likes", "Likes"],
              ["origPrice", "Original Price"],
              ["salePrice", "Sale Price"],
              ["quantity", "Quantity"],
              ["sold", "Sold"],
              ["dateSold", "Date Sold"],
            ].map(([key, label]) => (
              <React.Fragment key={key}>
                <label>{label}</label>
                <input
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  type={
                    ["likes", "origPrice", "salePrice", "quantity", "sold"].includes(key)
                      ? "number"
                      : key === "dateSold"
                      ? "date"
                      : "text"
                  }
                />
              </React.Fragment>
            ))}

            <label className="checkbox-label">
                <input
                    type="checkbox"
                    name="nwt"
                    checked={formData.nwt}
                    onChange={(e) =>
                    setFormData((prev) => ({ ...prev, nwt: e.target.checked }))
                    }
                />
                New With Tags (NWT)
            </label>

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

    const [platformFilter, setPlatformFilter] = useState("All");
    const [brandFilter, setBrandFilter] = useState("All");
    const [sortBy, setSortBy] = useState("name-asc");
    const [search, setSearch] = useState("");
    const [monthFilter, setMonthFilter] = useState("All");


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
        setItems((prev) =>
          editingItem
            ? prev.map((i) => (i._id === editingItem._id ? saved : i))
            : [...prev, saved]
        );
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

    if (loading) return <div className="loading-message">Loading inventory...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    const allBrands = Array.from(new Set(items.map((i) => i.brand).filter(Boolean)));

    // ✅ Filtering & Sorting Logic
    let filtered = items.filter((i) => {
        let month = null;
        if (i.dateSold && /^\d{4}-\d{2}-\d{2}$/.test(i.dateSold)) {
        const [, m] = i.dateSold.split("-");
        month = Number(m);
        }


        return (
            (platformFilter === "All" || i.platform === platformFilter) &&
            (brandFilter === "All" || i.brand === brandFilter) &&
            (monthFilter === "All" || month === Number(monthFilter)) &&
            (i.name?.toLowerCase().includes(search.toLowerCase()) ||
            i.type?.toLowerCase().includes(search.toLowerCase()))
        );
    });

    filtered.sort((a, b) => {
      const [field, dir] = sortBy.split("-");
      let valA, valB;
      if (field === "name") {
        valA = a.name?.toLowerCase();
        valB = b.name?.toLowerCase();
      } else if (field === "profit") {
        valA = a.totalProfit;
        valB = b.totalProfit;
      } else if (field === "dateSold") {
        valA = a.dateSold || "";
        valB = b.dateSold || "";
        if (dir === "asc") return valA.localeCompare(valB);
        return valB.localeCompare(valA);
        }
    });

    const totalProfit = filtered.reduce((sum, i) => sum + (i.totalProfit || 0), 0);
    const totalRevenue = filtered.reduce((sum, i) => sum + (i.salePrice * i.sold || 0), 0);
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return (
      <div className="app-container">
        <h1>🧾 Clothing Inventory</h1>

        <div className="summary-grid">
        <div className="summary-card profit">
            <h3>Total Profit</h3>
            <p>${totalProfit.toFixed(2)}</p>
        </div>

        <div className="summary-card revenue">
            <h3>Total Revenue</h3>
            <p>${totalRevenue.toFixed(2)}</p>
        </div>

        <div className="summary-card margin">
            <h3>Profit Margin</h3>
            <p>{profitMargin.toFixed(1)}%</p>
        </div>
        </div>

        {/* Filter + Sort */}
        <FilterSortControls
        platformFilter={platformFilter}
        setPlatformFilter={setPlatformFilter}
        brandFilter={brandFilter}
        setBrandFilter={setBrandFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        allBrands={allBrands}
        search={search}
        setSearch={setSearch}
        monthFilter={monthFilter}
        setMonthFilter={setMonthFilter}
        />


        {/* Charts */}
        <ProfitChart data={filtered} title="Platform" groupBy="platform" />
        <ProfitChart data={filtered} title="Brand" groupBy="brand" />

        {/* Items */}
        <button className="add-button" onClick={() => setShowModal(true)}>
          + Add Item
        </button>

        <ItemList
          items={filtered}
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
