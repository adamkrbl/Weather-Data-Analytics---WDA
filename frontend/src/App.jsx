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

  return JSON.parse(
    localStorage.getItem("history")
  ) || [];

});

  useEffect(() => {

  localStorage.setItem(
    "history",
    JSON.stringify(history)
  );

}, [history]);

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
          `http://127.0.0.1:8000/weather-by-coords/${latitude}/${longitude}`
        );

        const data = await response.json();

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

  const searchCity = async (cityName) => {

    setLoading(true);
    setError("");
    setWeatherData(null);

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/weather/${cityName}`
      );

      const data = await response.json();

      if (data.error) {

        setError(data.error);

      } else {

        setWeatherData(data);

        setHistory((prev) => {

          const updated = [
            cityName,
            ...prev.filter(
              (item) =>
                item.toLowerCase() !== cityName.toLowerCase()
            )
          ];

          const finalHistory =
              updated.slice(0, 5);

            localStorage.setItem(
              "weatherHistory",
              JSON.stringify(finalHistory)
            );

            return finalHistory;
                    });
      }
      
    } catch (error) {

      setError("Something went wrong.");
    }

    setLoading(false);
  };

  const getWeather = async () => {
    await searchCity(city);
  };

  return (
    <div className="container">
      <div className="dashboard">
        <h1 className="title">
          Weather Analytics
        </h1>

        <p className="subtitle">
          Real-time weather dashboard
        </p>

            <div className="search-wrapper">

        {history.length > 0 && (

          <div className="history-section">

            <h3>
              Recent Searches
            </h3>

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

        <div className="search-box">

          <input
            type="text"
            placeholder="Enter city..."
            value={city}
            onChange={(event) => setCity(event.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchCity(city);
              }
            }}
          />

          <button
            onClick={() => searchCity(city)}
          >
            Search
          </button>

          <button
            className="location-btn"
            onClick={getCurrentLocation}
          >
            📍 My Location
          </button>

        </div>

      </div>

      {loading && (
        <p className="loading">
          Loading...
        </p>
      )}

        {error && (
          <p className="error">
            {error}
          </p>
        )}

        {weatherData && (
          <div className="weather-card">

            <h2 className="city-name">
              {weatherData.city.toUpperCase()}
            </h2>

            <div className="temperature">
              {weatherData.current_temperature}°C
            </div>

            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "center",
                gap: "30px",
                flexWrap: "wrap"
              }}
            >

              <div>
                💧 Vlhkosť: {weatherData.humidity}%
              </div>

              <div>
                🌬 Vietor: {weatherData.wind_speed} km/h
              </div>

              <div>
                🌡 Pocitová: {weatherData.feels_like}°C
              </div>

            </div>
            <div className="stats">

              <div className="stat-box">
                <h3>🌡 Average</h3>
                <p>{weatherData.average_temperature}°C</p>
              </div>

              <div className="stat-box">
                <h3>🔥 Max</h3>
                <p>{weatherData.max_temperature}°C</p>
              </div>

              <div className="stat-box">
                <h3>❄️ Min</h3>
                <p>{weatherData.min_temperature}°C</p>
              </div>

            </div>

            <div
              style={{
                width: "100%",
                height: 350,
                marginTop: "40px"
              }}
            >
              <h3
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  color: "#2563eb"
                }}
              >
                24 Hour Temperature Trend
              </h3>

              <div
                style={{
                  width: "100%",
                  height: "350px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weatherData.chart_data}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="time" />

                    <YAxis />

                    <Tooltip
                      formatter={(value) => [`${value} °C`, "Temperature"]}
                    />

                    <Line
                      type="monotone"
                      dataKey="temperature"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      animationDuration={1200}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="forecast-section">
            <h3>7 Day Forecast</h3>

            <div className="forecast-grid">

              {weatherData.forecast.map((day, index) => (
                <div
                  key={index}
                  className="forecast-card"
                >
                  <p className="forecast-date">
                    {day.date}
                  </p>

                  <p className="forecast-max">
                    ↑ {day.max}°C
                  </p>

                  <p className="forecast-min">
                    ↓ {day.min}°C
                  </p>
                </div>
              ))}

            </div>
            <div className="map-section">

            <h3>Location Map</h3>

            <MapContainer
              center={[
                weatherData.latitude,
                weatherData.longitude
              ]}
              zoom={10}
              style={{
                height: "400px",
                width: "100%",
                borderRadius: "20px"
              }}
            >

              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker
                position={[
                  weatherData.latitude,
                  weatherData.longitude
                ]}
              >
                <Popup>
                  {weatherData.city}
                </Popup>
              </Marker>

            </MapContainer>

          </div>
          </div>
          </div>
          
               )}
      </div>

      <footer
        style={{
          marginTop: "25px",
          color: "#64748b",
          fontSize: "13px",
          textAlign: "center"
        }}
      >
        Built with React • FastAPI • Open-Meteo<br />
        Powered by Adam
      </footer>

    </div>
  );
}

export default App;