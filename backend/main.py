from app.services.weather_service import fetch_weather_data
from app.analytics.temperature_analysis import analyze_temperature_data
from app.analytics.visualization import create_temperature_chart

# City coordinates
cities = {
    "bratislava": (48.15, 17.11),
    "london": (51.50, -0.12),
    "prague": (50.08, 14.43),
    "new york": (40.71, -74.00),
    "tokyo": (35.68, 139.69)
}

# User input
city = input("Enter city name: ").lower()

if city in cities:

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

    # Create analytics chart
    create_temperature_chart(
        df,
        city
    )

else:
    print("City not found.")