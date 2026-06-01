import pandas as pd


def analyze_temperature_data(file_path):

    # Load CSV
    df = pd.read_csv(file_path)

    # Convert time column
    df["time"] = pd.to_datetime(df["time"])

    # Basic statistics
    average_temp = df["temperature"].mean()
    max_temp = df["temperature"].max()
    min_temp = df["temperature"].min()

    # Hottest hour
    hottest_row = df.loc[df["temperature"].idxmax()]
    hottest_time = hottest_row["time"]

    # Moving average
    df["moving_average"] = df["temperature"].rolling(window=3).mean()

    print("\n=== WEATHER ANALYTICS ===")
    print(f"Average temperature: {average_temp:.2f} °C")
    print(f"Maximum temperature: {max_temp:.2f} °C")
    print(f"Minimum temperature: {min_temp:.2f} °C")
    print(f"Hottest hour: {hottest_time}")

    return df