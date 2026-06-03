import requests
import pandas as pd


def fetch_weather_data(city_name, latitude, longitude):
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={latitude}"
        f"&longitude={longitude}"
        f"&hourly=temperature_2m"
        f"&daily=temperature_2m_max,temperature_2m_min"
        f"&forecast_days=7"
        f"&current="
        f"temperature_2m,"
        f"relative_humidity_2m,"
        f"wind_speed_10m,"
        f"apparent_temperature"
    )

    response = requests.get(url)
    data = response.json()

    if "error" in data:
        return data

    # safe check
    if "hourly" not in data:
        return {"error": "Invalid API response"}

    times = data["hourly"]["time"]
    temperatures = data["hourly"]["temperature_2m"]

    df = pd.DataFrame({
        "time": times,
        "temperature": temperatures
    })

    print("Weather data fetched successfully")

    return data