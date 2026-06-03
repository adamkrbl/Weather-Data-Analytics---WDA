from fastapi import APIRouter
import time

from app.services.weather_service import fetch_weather_data
from app.analytics.temperature_analysis import analyze_temperature_data
from app.services.geocoding_service import (
    get_city_coordinates,
    get_city_from_coordinates
)

router = APIRouter()

# simple in-memory cache
CACHE = {}
CACHE_TTL = 600  # 10 min cache


def is_cache_valid(entry_time):
    return time.time() - entry_time < CACHE_TTL


@router.get("/")
def home():
    return {"message": "Weather Analytics API is running"}


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.get("/weather-by-coords/{lat}/{lon}")
def weather_by_coords(lat: float, lon: float):

    cache_key = f"coords_{lat}_{lon}"

    # CACHE CHECK
    if cache_key in CACHE:
        data, timestamp = CACHE[cache_key]
        if is_cache_valid(timestamp):
            return data

    weather = fetch_weather_data(
        city_name="current_location",
        latitude=lat,
        longitude=lon
    )

    if "error" in weather:
        return weather

    city_name = get_city_from_coordinates(lat, lon)

    df = analyze_temperature_data(weather)

    current = weather["current"]
    daily = weather["daily"]

    chart_data = [
        {
            "time": str(row["time"])[11:16],
            "temperature": row["temperature"]
        }
        for _, row in df.head(24).iterrows()
    ]

    forecast = [
        {
            "date": daily["time"][i],
            "max": daily["temperature_2m_max"][i],
            "min": daily["temperature_2m_min"][i]
        }
        for i in range(len(daily["time"]))
    ]

    result = {
        "city": city_name,
        "latitude": lat,
        "longitude": lon,

        "current_temperature": current["temperature_2m"],
        "humidity": current["relative_humidity_2m"],
        "wind_speed": current["wind_speed_10m"],
        "feels_like": current["apparent_temperature"],

        "average_temperature": round(df["temperature"].mean(), 2),
        "max_temperature": round(df["temperature"].max(), 2),
        "min_temperature": round(df["temperature"].min(), 2),

        "chart_data": chart_data,
        "forecast": forecast
    }

    CACHE[cache_key] = (result, time.time())

    return result


@router.get("/weather/{city}")
def get_weather(city: str):

    city_key = city.lower().strip()

    # CACHE CHECK
    if city_key in CACHE:
        data, timestamp = CACHE[city_key]
        if is_cache_valid(timestamp):
            return data

    coordinates = get_city_coordinates(city)

    if coordinates is None:
        return {"error": "City not found"}

    latitude, longitude = coordinates

    weather = fetch_weather_data(city, latitude, longitude)

    if "error" in weather:
        return weather

    df = analyze_temperature_data(weather)

    current = weather["current"]
    daily = weather["daily"]

    forecast = [
        {
            "date": daily["time"][i],
            "max": daily["temperature_2m_max"][i],
            "min": daily["temperature_2m_min"][i]
        }
        for i in range(len(daily["time"]))
    ]

    chart_data = [
        {
            "time": str(row["time"])[11:16],
            "temperature": row["temperature"]
        }
        for _, row in df.head(24).iterrows()
    ]

    result = {
        "city": city,
        "latitude": latitude,
        "longitude": longitude,

        "current_temperature": current["temperature_2m"],
        "humidity": current["relative_humidity_2m"],
        "wind_speed": current["wind_speed_10m"],
        "feels_like": current["apparent_temperature"],

        "average_temperature": round(df["temperature"].mean(), 2),
        "max_temperature": round(df["temperature"].max(), 2),
        "min_temperature": round(df["temperature"].min(), 2),

        "chart_data": chart_data,
        "forecast": forecast
    }

    CACHE[city_key] = (result, time.time())

    return result