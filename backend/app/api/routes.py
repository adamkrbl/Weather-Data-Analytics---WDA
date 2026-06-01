from fastapi import APIRouter
from app.services.weather_service import fetch_weather_data
from app.analytics.temperature_analysis import analyze_temperature_data

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


# City coordinates
cities = {
    "bratislava": (48.15, 17.11),
    "london": (51.50, -0.12),
    "prague": (50.08, 14.43),
    "new york": (40.71, -74.00),
    "tokyo": (35.68, 139.69)
}


@router.get("/weather/{city}")
def get_weather(city: str):

    city = city.lower()

    # Check city
    if city not in cities:

        return {
            "error": "City not found"
        }

    latitude, longitude = cities[city]

    # Fetch weather data
    fetch_weather_data(
        city_name=city,
        latitude=latitude,
        longitude=longitude
    )

    # Analyze data
    df = analyze_temperature_data(
        f"data/{city}_weather.csv"
    )

    # Return analytics
    return {
        "city": city,
        "average_temperature": round(df["temperature"].mean(), 2),
        "max_temperature": round(df["temperature"].max(), 2),
        "min_temperature": round(df["temperature"].min(), 2)
    }