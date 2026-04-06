import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "Disaster Intelligence API"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/disaster_db")
    NASA_API_URL: str = "https://eonet.gsfc.nasa.gov/api/v3/events"
    MODEL_PATH: str = "app/ml/model.pkl"
    FETCH_INTERVAL_HOURS: int = 6
    
    # Additional environment variables
    OPENAI_API_KEY: Optional[str] = None
    NASA_API_BASE: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "ignore"  # Allow extra fields in .env without validation errors

settings = Settings()
