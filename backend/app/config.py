import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Disaster Intelligence API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/disaster_db")
    NASA_API_URL: str = "https://eonet.gsfc.nasa.gov/api/v3/events"
    MODEL_PATH: str = "app/ml/model.pkl"
    FETCH_INTERVAL_HOURS: int = 6

    class Config:
        env_file = ".env"

settings = Settings()
