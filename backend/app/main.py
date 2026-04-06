from fastapi import FastAPI

from app.services.nasa_service import fetch_nasa_events
from app.services.feature_engineering import generate_features
from app.services.dataset_builder import build_dataset
from app.ml.train import train_model

from app.ml.predict import predict_risk
from datetime import datetime

from app.services.geo_features import compute_event_count
from app.services.db_service import save_events, get_events

from app.services.scheduler import start_scheduler

app = FastAPI()
start_scheduler()


@app.get("/")
def root():
    return {"message": "Disaster Intelligence API Running"}


@app.get("/events")
def get_events():
    events = fetch_nasa_events()
    return events[:50]


# 🚀 TRAIN MODEL ENDPOINT
@app.get("/train")
def train():
    # Step 1: fetch events
    events = fetch_nasa_events()

    # Step 2: feature engineering
    features_df = generate_features(events)

    # Step 3: build dataset
    dataset = build_dataset(features_df)

    # Step 4: train model
    train_model(dataset)

    return {"message": "Model trained successfully"}

# 🚀 PREDICT RISK ENDPOINT
@app.get("/predict")
def predict(lat: float, lon: float):
    # Step 1: fetch real events
    events = get_events()

    # Step 2: compute REAL feature
    event_count_30d = compute_event_count(events, lat, lon)

    # Step 3: current month
    month = datetime.now().month

    # Step 4: predict
    risk_score = predict_risk(event_count_30d, month)

    return {
        "lat": lat,
        "lon": lon,
        "event_count_30d": event_count_30d,
        "risk_score": risk_score
    }