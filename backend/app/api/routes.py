from fastapi import APIRouter
from app.services.weather_service import fetch_weather_data
from app.analytics.temperature_analysis import analyze_temperature_data
from app.services.geocoding_service import (
    get_city_coordinates,
    get_city_from_coordinates
)

router = APIRouter()


@router.get("/")
def home():

    return {
        "message": "Weather Analytics API is running"
    }


@router.get("/health")
def health_check():

    return {
        "status": "ok"
    }


@router.get("/weather-by-coords/{lat}/{lon}")
def weather_by_coords(lat: float, lon: float):

   weather = fetch_weather_data(
    city_name="current_location",
    latitude=lat,
    longitude=lon
)

if "error" in weather:
    return weather

    city_name = get_city_from_coordinates(
        lat,
        lon
    )

    df = analyze_temperature_data(
        "data/current_location_weather.csv"
    )

    current = weather["current"]
    daily = weather["daily"]

    chart_data = []

    for _, row in df.head(24).iterrows():

        chart_data.append({
            "time": str(row["time"])[11:16],
            "temperature": row["temperature"]
        })

    forecast = []

    for i in range(len(daily["time"])):

        forecast.append({
            "date": daily["time"][i],
            "max": daily["temperature_2m_max"][i],
            "min": daily["temperature_2m_min"][i]
        })

    return {

        "city": city_name,

        "latitude": lat,
        "longitude": lon,

        "current_temperature":
            current["temperature_2m"],

        "humidity":
            current["relative_humidity_2m"],

        "wind_speed":
            current["wind_speed_10m"],

        "feels_like":
            current["apparent_temperature"],

        "average_temperature":
            round(df["temperature"].mean(), 2),

        "max_temperature":
            round(df["temperature"].max(), 2),

        "min_temperature":
            round(df["temperature"].min(), 2),

        "chart_data":
            chart_data,

        "forecast":
            forecast
    }

@router.get("/weather/{city}")
def get_weather(city: str):

    coordinates = get_city_coordinates(city)

    if coordinates is None:
        return {
            "error": "City not found"
        }

    latitude, longitude = coordinates

    weather = fetch_weather_data(
    city_name=city,
    latitude=latitude,
    longitude=longitude
)

if "error" in weather:
    return weather

    df = analyze_temperature_data(
        f"data/{city.lower()}_weather.csv"
    )

    current = weather["current"]
    daily = weather["daily"]

    forecast = []

    for i in range(len(daily["time"])):

        forecast.append({
            "date": daily["time"][i],
            "max": daily["temperature_2m_max"][i],
            "min": daily["temperature_2m_min"][i]
        })

    chart_data = []

    for _, row in df.head(24).iterrows():

        chart_data.append({
            "time": str(row["time"])[11:16],
            "temperature": row["temperature"]
        })

    return {

        "city": city,

        "latitude": latitude,
        "longitude": longitude,

        "current_temperature":
            current["temperature_2m"],

        "humidity":
            current["relative_humidity_2m"],

        "wind_speed":
            current["wind_speed_10m"],

        "feels_like":
            current["apparent_temperature"],

        "average_temperature":
    round(df["temperature"].mean(), 2),

"max_temperature":
    round(df["temperature"].max(), 2),

"min_temperature":
    round(df["temperature"].min(), 2),

"chart_data":
    chart_data,

        "forecast":
            forecast
    }