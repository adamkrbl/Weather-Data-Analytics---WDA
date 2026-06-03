import pandas as pd


def analyze_temperature_data(weather_data):

    hourly = weather_data["hourly"]

    df = pd.DataFrame({
        "time": hourly["time"],
        "temperature": hourly["temperature_2m"]
    })

    df["time"] = pd.to_datetime(df["time"])

    df["moving_average"] = df["temperature"].rolling(window=3).mean()

    print("Weather analytics computed")

    return df