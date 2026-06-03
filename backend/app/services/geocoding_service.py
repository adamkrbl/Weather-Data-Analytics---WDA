import requests


def get_city_coordinates(city_name):

    url = (
        "https://geocoding-api.open-meteo.com/v1/search"
        f"?name={city_name}"
        "&count=1"
    )

    response = requests.get(url)

    data = response.json()

    if "results" not in data:
        return None

    city = data["results"][0]

    return (
        city["latitude"],
        city["longitude"]
    )


def get_city_from_coordinates(lat, lon):

    print("LAT:", lat)
    print("LON:", lon)

    url = (
        "https://nominatim.openstreetmap.org/reverse"
        f"?lat={lat}"
        f"&lon={lon}"
        "&format=json"
    )

    headers = {
        "User-Agent": "WeatherAnalyticsApp"
    }

    response = requests.get(
        url,
        headers=headers
    )

    data = response.json()

    print("NOMINATIM:", data)

    address = data.get("address", {})

    return (
        address.get("city")
        or address.get("town")
        or address.get("village")
        or address.get("municipality")
        or "Unknown Location"
    )