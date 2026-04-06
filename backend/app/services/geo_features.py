from datetime import datetime, timedelta
import math


# Haversine formula → distance between 2 lat/lon points
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km

    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def compute_event_count(events, lat, lon, days=30, radius_km=500):
    cutoff_date = datetime.now() - timedelta(days=days)

    count = 0

    for event in events:
        event_date = event["date"]

        if event_date < cutoff_date:
            continue

        distance = haversine(lat, lon, event["latitude"], event["longitude"])

        if distance <= radius_km:
            count += 1

    return count