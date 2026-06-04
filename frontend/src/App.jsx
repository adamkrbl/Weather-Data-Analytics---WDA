import { useState, useEffect } from "react";
import "./App.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
});

function App() {
  const [city, setCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState(() => {
  return JSON.parse(localStorage.getItem("history")) || [];
});

  useEffect(() => {
    const handleBack = () => {
      setWeatherData(null);
      setError("");
    };

    window.addEventListener("popstate", handleBack);

    return () => {
      window.removeEventListener("popstate", handleBack);
    };
  }, []);
  // -----------------------------
  // LOCATION WEATHER
  // -----------------------------
  const getCurrentLocation = () => {
    setLoading(true);
    setError("");
    setWeatherData(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        try {
          const response = await fetch(
            `https://wda-wovt.onrender.com/weather-by-coords/${latitude}/${longitude}`
          );

          const data = await response.json();

          if (!response.ok || data.error) {
            setError(data.error || data.reason || "API error");
            setLoading(false);
            return;
          }

          window.history.pushState(
            { weather: true },
            "",
            ""
          );

          setWeatherData(data);
        } catch (error) {
          setError("Could not get your location.");
        }

        setLoading(false);
      },
      () => {
        setError("Location access denied.");
        setLoading(false);
      }
    );
  };

  // -----------------------------
  // SEARCH CITY
  // -----------------------------
  const searchCity = async (cityName) => {
    const query = cityName.trim();

    if (!query) {
      setError("Zadajte mesto");
      return;
    }

    setLoading(true);
    setError("");
    setWeatherData(null);

    try {
      const response = await fetch(
        `https://wda-wovt.onrender.com/weather/${query}`
      );

      const data = await response.json();

      if (!response.ok || data.error) {
        setError(data.error || "Server error");
        setLoading(false);
        return;
      }

        window.history.pushState(
          { weather: true },
          "",
          ""
        );

        setWeatherData(data);

      // history
      setHistory((prev) => {
        const updated = [
          query,
          ...prev.filter(
            (item) => item.toLowerCase() !== query.toLowerCase()
          )
        ].slice(0, 5);

        localStorage.setItem("history", JSON.stringify(updated));
        return updated;
      });

    } catch (error) {
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="dashboard">
        <h1 className="title">WDA</h1>

        <p className="subtitle">
          Počasie a predpoveď do vrecka
        </p>

        {/* HISTORY */}
        {history.length > 0 && (
          <div className="history-section">
            <h3>Nedávne vyhľadávania</h3>

            <div className="history-list">
              {history.map((item, index) => (
                <button
                  key={index}
                  className="history-btn"
                  onClick={() => {
                    setCity(item);
                    searchCity(item);
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SEARCH */}
        <div className="search-box">
          <input
            type="text"
            placeholder="Zadajte mesto..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchCity(city);
              }
            }}
          />

          <button onClick={() => searchCity(city)}>
            Hľadať
          </button>

          <button
            className="location-btn"
            onClick={getCurrentLocation}
          >
            📍 Moja poloha
          </button>
        </div>

        {/* LOADING */}
        {loading && <p className="loading">Načítavam...</p>}

        {/* ERROR */}
        {error && <p className="error">{error}</p>}

        {/* WEATHER */}
        {weatherData && weatherData.city && (
          <div className="weather-card">
            <h2 className="city-name">
              {weatherData.city.toUpperCase()}
            </h2>

            <div className="temperature">
              {weatherData.current_temperature}°C
            </div>

            <div className="stats">
              <div>💧 {weatherData.humidity}%</div>
              <div>🌬 {weatherData.wind_speed} km/h</div>
              <div>🌡 {weatherData.feels_like}°C</div>
            </div>

            {/* CHART */}
            <div style={{ height: 350, marginTop: 30 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weatherData.chart_data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis hide />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* FORECAST */}
            <div className="forecast-section">
              <h3>7-dňová predpoveď</h3>

              <div className="forecast-grid">
                {weatherData.forecast.map((day, i) => (
                  <div key={i} className="forecast-card">

                    <div className="forecast-date">
                      {new Date(day.date).toLocaleDateString("sk-SK")}
                    </div>

                    <div className="forecast-max">
                      <span className="weather-icon">☀️</span>
                      <span>{day.max}°C</span>
                    </div>

                    <div className="forecast-min">
                      <span className="weather-icon">🌙</span>
                      <span>{day.min}°C</span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* MAP */}
            <MapContainer
              center={[
                weatherData.latitude,
                weatherData.longitude
              ]}
              zoom={10}
              style={{
                height: "400px",
                width: "100%",
                borderRadius: "20px",
                marginTop: "20px"
              }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

              <Marker
                position={[
                  weatherData.latitude,
                  weatherData.longitude
                ]}
              >
                <Popup>{weatherData.city}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>

      <footer className="footer">
        Built with React • FastAPI • Open-Meteo
        <br />
        <span className="footer-author">
          Powered by Adam
        </span>
      </footer>
    </div>
  );
}

export default App;