// PriceTracker.js
import React, { useState, useEffect } from "react";
import "../assets/styles/Price.css";

const Price = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    state: "",
    district: "",
    market: "",
    commodity: "",
  });

  // API configuration
  const API_KEY = "579b464db66ec23bdd000001577ffbe80686406561ca6da0e7dc7f3d"; // Replace with your actual API key
  const API_URL =
    "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070";

  // Fetch data from the API
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Construct API URL with parameters
      const params = new URLSearchParams({
        "api-key": API_KEY,
        format: "json",
        limit: 100,
        offset: 0,
      });

      // Add filters if selected
      if (filters.state) params.append("filters[state]", filters.state);
      if (filters.district)
        params.append("filters[district]", filters.district);
      if (filters.market) params.append("filters[market]", filters.market);
      if (filters.commodity)
        params.append("filters[commodity]", filters.commodity);

      const response = await fetch(`${API_URL}?${params}`);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.records && Array.isArray(data.records)) {
        setMarketData(data.records);
      } else {
        throw new Error("Invalid data format received from API");
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching market data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and set up interval for updates
  useEffect(() => {
    fetchMarketData();

    // Set up interval to fetch data every 30 minutes
    const intervalId = setInterval(fetchMarketData, 30 * 60 * 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchMarketData();
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      state: "",
      district: "",
      market: "",
      commodity: "",
    });
    // We need to fetch data without filters after a small delay
    setTimeout(fetchMarketData, 100);
  };

  // Get unique values for filter dropdowns
  const states = [...new Set(marketData.map((item) => item.state))].sort();
  const districts = [
    ...new Set(marketData.map((item) => item.district)),
  ].sort();
  const markets = [...new Set(marketData.map((item) => item.market))].sort();
  const commodities = [
    ...new Set(marketData.map((item) => item.commodity)),
  ].sort();

  return (
    <div className="price-tracker">
      <header className="header">
        <h1>Agricultural Market Price Tracker</h1>
        <p>Real-time prices from markets across India</p>
      </header>

      <div className="controls">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="state">State</label>
            <select
              id="state"
              name="state"
              value={filters.state}
              onChange={handleFilterChange}
            >
              <option value="">All States</option>
              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="district">District</label>
            <select
              id="district"
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
            >
              <option value="">All Districts</option>
              {districts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="market">Market</label>
            <select
              id="market"
              name="market"
              value={filters.market}
              onChange={handleFilterChange}
            >
              <option value="">All Markets</option>
              {markets.map((market) => (
                <option key={market} value={market}>
                  {market}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="commodity">Commodity</label>
            <select
              id="commodity"
              name="commodity"
              value={filters.commodity}
              onChange={handleFilterChange}
            >
              <option value="">All Commodities</option>
              {commodities.map((commodity) => (
                <option key={commodity} value={commodity}>
                  {commodity}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-buttons">
            <button onClick={applyFilters} className="apply-btn">
              Apply Filters
            </button>
            <button onClick={resetFilters} className="reset-btn">
              Reset Filters
            </button>
            <button onClick={fetchMarketData} className="refresh-btn">
              <i className="fas fa-sync-alt"></i> Refresh Data
            </button>
          </div>
        </div>
      </div>

      <main className="main-content">
        {loading && <div className="loading">Loading market data...</div>}

        {error && (
          <div className="error">
            <h3>Error: {error}</h3>
            <p>Please check your API key and try again.</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="stats">
              <p>Showing {marketData.length} records</p>
              <p>Last updated: {new Date().toLocaleTimeString()}</p>
            </div>

            <div className="table-container">
              <table className="market-table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>District</th>
                    <th>Market</th>
                    <th>Commodity</th>
                    <th>Variety</th>
                    <th>Min Price (₹/quintal)</th>
                    <th>Max Price (₹/quintal)</th>
                    <th>Modal Price (₹/quintal)</th>
                  </tr>
                </thead>
                <tbody>
                  {marketData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.state || "N/A"}</td>
                      <td>{item.district || "N/A"}</td>
                      <td>{item.market || "N/A"}</td>
                      <td>{item.commodity || "N/A"}</td>
                      <td>{item.variety || "N/A"}</td>
                      <td>{item.min_price || "N/A"}</td>
                      <td>{item.max_price || "N/A"}</td>
                      <td
                        className={item.modal_price > 5000 ? "high-price" : ""}
                      >
                        {item.modal_price || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <p>
          Data sourced from{" "}
          <a
            href="https://data.gov.in"
            target="_blank"
            rel="noopener noreferrer"
          >
            Data.gov.in
          </a>
        </p>
        <p>Prices update every 30 minutes</p>
      </footer>
    </div>
  );
};

export default Price;
