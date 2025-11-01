window.onload = () => {
  console.log("✅ Clothing Inventory App Loading...");
  const API_URL = "https://resalemanager.onrender.com";
  const { useState, useEffect } = React;

  // ✅ ProfitChart Component
  function ProfitChart({ data, title, groupBy }) {
    const canvasRef = React.useRef(null);

    // group profits
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

  // ✅ ItemList (clean UI)
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

  // ✅ App Component
  function App() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      fetch(API_URL + "/api/items")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch items");
          return res.json();
        })
        .then((data) => {
          console.log("✅ Items loaded:", data.length);
          setItems(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("❌ Fetch error:", err);
          setError(err.message);
          setLoading(false);
        });
    }, []);

    if (loading)
      return <div className="loading-message">Loading inventory...</div>;
    if (error) return <div className="error-message">Error: {error}</div>;

    const totalProfit = items.reduce((sum, i) => sum + (i.totalProfit || 0), 0);

    return (
      <div className="app-container">
        <h1>🧾 Clothing Inventory</h1>
        <div className="total-profit">Total Profit: ${totalProfit.toFixed(2)}</div>

        {/* ✅ Add Charts */}
        <ProfitChart data={items} title="Platform" groupBy="platform" />
        <ProfitChart data={items} title="Brand" groupBy="brand" />

        {/* ✅ Item List */}
        <ItemList items={items} onEdit={() => {}} onDelete={() => {}} />
      </div>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
};
