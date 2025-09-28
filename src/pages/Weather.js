import React, { useState, useEffect } from "react";
import axios from "axios";

function Weather() {
  const [location, setLocation] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("metric"); // metric for Celsius, imperial for Fahrenheit

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          fetchWeatherByCoords(latitude, longitude);
        },
        (err) => {
          setError("Unable to access your location. Please enter a city name.");
          setLoading(false);
          // Set a default location (London) if geolocation fails
          fetchWeatherByCity("London");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      setLoading(false);
      // Set a default location (London) if geolocation is not supported
      fetchWeatherByCity("London");
    }
  }, []);

  // Fetch weather by coordinates
  const fetchWeatherByCoords = async (lat, lon) => {
    try {
      setLoading(true);
      const API_KEY = "3e2d7296586d04c865c3378dc73d3354";
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=${unit}`
      );

      setWeather({
        location: response.data.name,
        temp: Math.round(response.data.main.temp),
        feels_like: Math.round(response.data.main.feels_like),
        condition: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        humidity: response.data.main.humidity,
        wind: response.data.wind.speed,
        pressure: response.data.main.pressure,
        country: response.data.sys.country,
      });
      setLoading(false);
      setError(null);
    } catch (err) {
      setError("Failed to fetch weather data");
      setLoading(false);
    }
  };

  // Fetch weather by city name
  const fetchWeatherByCity = async (city) => {
    try {
      setLoading(true);
      const API_KEY = "3e2d7296586d04c865c3378dc73d3354";
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`
      );

      setWeather({
        location: response.data.name,
        temp: Math.round(response.data.main.temp),
        feels_like: Math.round(response.data.main.feels_like),
        condition: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        humidity: response.data.main.humidity,
        wind: response.data.wind.speed,
        pressure: response.data.main.pressure,
        country: response.data.sys.country,
      });
      setLoading(false);
      setError(null);
    } catch (err) {
      setError("City not found. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (location.trim()) {
      fetchWeatherByCity(location.trim());
    }
  };

  const refreshLocation = () => {
    if (userLocation) {
      fetchWeatherByCoords(userLocation.lat, userLocation.lon);
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === "metric" ? "imperial" : "metric";
    setUnit(newUnit);

    // Refetch weather data with new units
    if (userLocation) {
      fetchWeatherByCoords(userLocation.lat, userLocation.lon);
    } else if (weather) {
      fetchWeatherByCity(weather.location);
    }
  };

  // Get appropriate unit symbols
  const tempSymbol = unit === "metric" ? "°C" : "°F";
  const speedSymbol = unit === "metric" ? "m/s" : "mph";

  return (
    <div
      style={{
        maxWidth: "100%", // Changed to full width
        margin: "0 auto",
        padding: "0", // Remove padding to use full screen
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        background:
          "linear-gradient(135deg, #8BC34A 0%, #4CAF50 25%, #2E7D32 50%, #1B5E20 75%, #33691E 100%)",
        minHeight: "100vh",
        color: "#fff",
        backgroundSize: "cover", // Ensure background covers entire screen
        backgroundAttachment: "fixed", // Creates parallax effect
        marginTop: "-90px",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.3)", // Darker overlay for better contrast
          backdropFilter: "blur(10px)",
          borderRadius: "0", // Remove border radius for full screen
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
          display: "flex",
          flexDirection: "column",
          paddingTop: "80px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "25px",
            fontSize: "32px", // Slightly larger
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)", // Add text shadow for readability
          }}
        >
          🌿 Weather 🌦️
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{
            marginBottom: "20px",
            display: "flex",
            maxWidth: "600px",
            margin: "0 auto 20px",
            width: "100%",
          }}
        >
          <input
            type="text"
            placeholder="Search for a city..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{
              flex: 1,
              padding: "15px 20px",
              border: "none",
              borderRadius: "50px 0 0 50px",
              fontSize: "16px",
              outline: "none",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "15px 25px",
              backgroundColor: "#388E3C",
              color: "white",
              border: "none",
              borderRadius: "0 50px 50px 0",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Search
          </button>
        </form>

        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "20px",
            maxWidth: "600px",
            margin: "0 auto",
            width: "100%",
          }}
        >
          <button
            onClick={refreshLocation}
            style={{
              flex: 1,
              padding: "15px",
              backgroundColor: "#689F38",
              color: "white",
              border: "none",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Refresh My Location
          </button>
          <button
            onClick={toggleUnit}
            style={{
              padding: "15px 25px",
              backgroundColor: "#558B2F",
              color: "white",
              border: "none",
              borderRadius: "50px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "16px",
            }}
          >
            Switch to {unit === "metric" ? "°F" : "°C"}
          </button>
        </div>

        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "60px",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <div style={{ fontSize: "64px", marginBottom: "15px" }}>⏳</div>
            <p style={{ fontSize: "20px" }}>Loading weather data...</p>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "15px",
              backgroundColor: "rgba(179, 45, 25, 0.3)",
              border: "1px solid rgba(179, 45, 25, 0.5)",
              borderRadius: "10px",
              color: "#fff",
              margin: "0 auto 20px",
              textAlign: "center",
              maxWidth: "600px",
              width: "100%",
            }}
          >
            {error}
          </div>
        )}

        {weather && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "25px 20px",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              borderRadius: "16px",
              backdropFilter: "blur(5px)",
              margin: "15px auto",
              maxWidth: "500px",
              width: "85%",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              height: "auto",
              minHeight: "380px",
            }}
          >
            <h3
              style={{
                marginBottom: "5px",
                fontSize: "28px",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.5)",
              }}
            >
              {weather.location}, {weather.country}
            </h3>
            <p style={{ marginTop: "0", opacity: "0.9", fontSize: "18px" }}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "30px 0",
                flexWrap: "wrap",
              }}
            >
              <img
                src={`http://openweathermap.org/img/wn/${weather.icon}@4x.png`}
                alt={weather.condition}
                style={{ width: "150px", height: "150px" }}
              />
              <div style={{ textAlign: "left", marginLeft: "20px" }}>
                <p
                  style={{
                    fontSize: "56px",
                    fontWeight: "bold",
                    margin: "0",
                    lineHeight: "1",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {weather.temp}
                  {tempSymbol}
                </p>
                <p
                  style={{
                    margin: "10px 0",
                    fontSize: "20px",
                    textTransform: "capitalize",
                  }}
                >
                  {weather.condition}
                </p>
                <p style={{ margin: "0", fontSize: "16px", opacity: "0.9" }}>
                  Feels like: {weather.feels_like}
                  {tempSymbol}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                marginTop: "40px",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div style={{ textAlign: "center", minWidth: "100px" }}>
                <div style={{ fontSize: "32px" }}>💧</div>
                <p
                  style={{
                    margin: "10px 0",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {weather.humidity}%
                </p>
                <p style={{ margin: "0", fontSize: "16px" }}>Humidity</p>
              </div>
              <div style={{ textAlign: "center", minWidth: "100px" }}>
                <div style={{ fontSize: "32px" }}>💨</div>
                <p
                  style={{
                    margin: "10px 0",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {weather.wind} {speedSymbol}
                </p>
                <p style={{ margin: "0", fontSize: "16px" }}>Wind Speed</p>
              </div>
              <div style={{ textAlign: "center", minWidth: "100px" }}>
                <div style={{ fontSize: "32px" }}>📊</div>
                <p
                  style={{
                    margin: "10px 0",
                    fontWeight: "bold",
                    fontSize: "18px",
                  }}
                >
                  {weather.pressure} hPa
                </p>
                <p style={{ margin: "0", fontSize: "16px" }}>Pressure</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Weather;
