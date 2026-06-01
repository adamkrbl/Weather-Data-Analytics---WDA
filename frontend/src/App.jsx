import { useState } from "react";
import "./App.css";

function App() {

  const [city, setCity] = useState("");

  const [weatherData, setWeatherData] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // Fetch weather data
  const getWeather = async () => {

    setLoading(true);

    setError("");

    setWeatherData(null);

    try {

      const response = await fetch(
        `http://127.0.0.1:8000/weather/${city}`
      );

      const data = await response.json();

      // Error handling
      if (data.error) {

        setError(data.error);

      } else {

        setWeatherData(data);
      }

    } catch (error) {

      setError("Something went wrong.");
    }

    setLoading(false);
  };

  return (

    <div className="container">

      <h1>Weather Analytics Dashboard</h1>

      <div className="search-box">

        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />

        <button onClick={getWeather}>
          Get Weather
        </button>

      </div>

      {/* Loading */}
      {loading && (
        <p className="loading">
          Loading weather analytics...
        </p>
      )}

      {/* Error */}
      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {/* Weather Data */}
      {weatherData && (

        <div className="weather-card">

          <h2>
            {weatherData.city.toUpperCase()}
          </h2>

          <p>
            Average Temperature:
            {" "}
            {weatherData.average_temperature}°C
          </p>

          <p>
            Max Temperature:
            {" "}
            {weatherData.max_temperature}°C
          </p>

          <p>
            Min Temperature:
            {" "}
            {weatherData.min_temperature}°C
          </p>

        </div>
      )}

    </div>
  );
}

export default App;