import requests
import pandas as pd

# Coordinates for Bratislava
latitude = 48.15
longitude = 17.11

# API URL
url = f"https://api.open-meteo.com/v1/forecast?latitude={latitude}&longitude={longitude}&hourly=temperature_2m"

# Request data
response = requests.get(url)

# Convert response to JSON
data = response.json()

# Extract hourly temperatures
times = data["hourly"]["time"]
temperatures = data["hourly"]["temperature_2m"]

# Create DataFrame
df = pd.DataFrame({
    "time": times,
    "temperature": temperatures
})

# Save to CSV
df.to_csv("weather_data.csv", index=False)

print("Weather data saved successfully!")