from fastapi import FastAPI

from app.services.nasa_service import fetch_nasa_events
from app.services.feature_engineering import generate_features
from app.services.dataset_builder import build_dataset
from app.ml.train import train_model

app = FastAPI()


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