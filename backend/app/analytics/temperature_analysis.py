import pandas as pd


def analyze_temperature_data(weather_data):
    """
    Works directly with Open-Meteo API response (NO CSV FILES)
    """

    hourly = weather_data["hourly"]

    df = pd.DataFrame({
        "time": hourly["time"],
        "temperature": hourly["temperature_2m"]
    })

    # convert time
    df["time"] = pd.to_datetime(df["time"])

    # statistics
    average_temp = df["temperature"].mean()
    max_temp = df["temperature"].max()
    min_temp = df["temperature"].min()

    # hottest hour
    hottest_row = df.loc[df["temperature"].idxmax()]
    hottest_time = hottest_row["time"]

    # moving average (optional)
    df["moving_average"] = df["temperature"].rolling(window=3).mean()

    # print logs (OK for debugging, but optional)
    print("\n=== WEATHER ANALYTICS ===")
    print(f"Average temperature: {average_temp:.2f} °C")
    print(f"Maximum temperature: {max_temp:.2f} °C")
    print(f"Minimum temperature: {min_temp:.2f} °C")
    print(f"Hottest hour: {hottest_time}")

    return df