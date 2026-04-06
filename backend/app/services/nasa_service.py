import requests
from datetime import datetime

NASA_URL = "https://eonet.gsfc.nasa.gov/api/v3/events"

def fetch_nasa_events():
    response = requests.get(NASA_URL)
    data = response.json()

    events = []

    for event in data["events"]:
        category = event["categories"][0]["title"]

        for geo in event["geometry"]:
            events.append({
                "id": event["id"],
                "category": category,
                "latitude": geo["coordinates"][1],
                "longitude": geo["coordinates"][0],
                "date": datetime.fromisoformat(geo["date"].replace("Z", "")),
                "source": event["sources"][0]["url"] if event["sources"] else None
            })

    return events