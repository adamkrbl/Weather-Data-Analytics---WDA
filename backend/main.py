from app.services.weather_service import fetch_weather_data

# City coordinates database
cities = {
    "bratislava": (48.15, 17.11),
    "london": (51.50, -0.12),
    "prague": (50.08, 14.43),
    "new york": (40.71, -74.00),
    "tokyo": (35.68, 139.69)
}

# Ask user for city
city = input("Enter city name: ").lower()

# Check if city exists
if city in cities:

    latitude, longitude = cities[city]

    fetch_weather_data(
        city_name=city,
        latitude=latitude,
        longitude=longitude
    )

else:
    print("City not found.")