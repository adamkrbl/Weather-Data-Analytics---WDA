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