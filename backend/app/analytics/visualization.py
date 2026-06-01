import matplotlib.pyplot as plt


def create_temperature_chart(df, city_name):

    # Create figure
    plt.figure(figsize=(14, 7))

    # Temperature line
    plt.plot(
        df["time"],
        df["temperature"],
        label="Temperature"
    )

    # Moving average line
    plt.plot(
        df["time"],
        df["moving_average"],
        label="Moving Average"
    )

    # Labels
    plt.title(f"Weather Analytics - {city_name.title()}")
    plt.xlabel("Time")
    plt.ylabel("Temperature (°C)")

    # Rotate dates
    plt.xticks(rotation=45)

    # Legend
    plt.legend()

    # Layout
    plt.tight_layout()

    # Save image
    file_name = f"data/{city_name}_analytics_chart.png"

    plt.savefig(file_name)

    # Show chart
    plt.show()

    print(f"Chart saved to {file_name}")