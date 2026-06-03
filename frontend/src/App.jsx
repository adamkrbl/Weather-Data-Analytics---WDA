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
        `https://wda-wovt.onrender.com/weather-by-coords/${latitude}/${longitude}`
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

    if (!cityName.trim()) {

      setError("Zadajte mesto");
      return;

    }
    setLoading(true);
    setError("");
    setWeatherData(null);

    try {

      const response = await fetch(
        `https://wda-wovt.onrender.com/weather/${cityName}`
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
          WDA
        </h1>

        <p className="subtitle">
          Počasie a predpoveď do vrecka
        </p>

            <div className="search-wrapper">

        {history.length > 0 && (

          <div className="history-section">

            <h3>
              Nedávne vyhľadávania
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
            placeholder="Zadajte mesto..."
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
            Hľadať
          </button>

          <button
            className="location-btn"
            onClick={getCurrentLocation}
          >
            📍 Moja poloha
          </button>

        </div>

      </div>

      {loading && (
        <p className="loading">
          Načítavam...
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
                <h3>🌡 Priemer</h3>
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
                Vývoj teploty za 24 hodín
              </h3>

              <div
                style={{
                  width: "100%",
                  height: window.innerWidth < 768 ? "280px" : "350px",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weatherData.chart_data}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 10
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="time" />

                    <YAxis hide />

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
            <h3>7-dňová predpoveď</h3>

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

            <h3>Mapa lokality</h3>

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