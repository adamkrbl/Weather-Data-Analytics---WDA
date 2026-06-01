import pandas as pd
import matplotlib.pyplot as plt

# Load CSV data
df = pd.read_csv("weather_data.csv")

# Convert time column to datetime
df["time"] = pd.to_datetime(df["time"])

# Create plot
plt.figure(figsize=(12, 6))
plt.plot(df["time"], df["temperature"])

# Labels
plt.title("Temperature Forecast")
plt.xlabel("Time")
plt.ylabel("Temperature (°C)")

# Rotate dates
plt.xticks(rotation=45)

# Adjust layout
plt.tight_layout()

# Save graph
plt.savefig("temperature_chart.png")

# Show graph
plt.show()