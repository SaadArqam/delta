from datetime import datetime, timedelta
import pandas as pd

def generate_features(events):
    df = pd.DataFrame(events)

    df["date"] = pd.to_datetime(df["date"])

    features = []

    for _, row in df.iterrows():
        lat, lon, date = row["latitude"], row["longitude"], row["date"]

        past_events = df[
            (df["date"] < date) &
            (df["date"] > date - timedelta(days=30))
        ]

        event_count_30d = len(past_events)

        features.append({
            "lat": lat,
            "lon": lon,
            "date": date,
            "event_count_30d": event_count_30d,
            "month": date.month,
        })

    return pd.DataFrame(features)