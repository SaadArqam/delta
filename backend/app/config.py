import os
from typing import Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings driven by environment variables.

    Keep reasonable defaults for local development but prefer env vars in
    production (Render / Vercel). Use simple types to keep this beginner
    friendly.
    """
    APP_NAME: str = "Disaster Intelligence API"
    # DATABASE_URL should be provided by the hosting provider in production
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/disaster_db")

    # External API endpoints can be overridden in production via env
    NASA_API_URL: str = os.getenv("NASA_API_URL", "https://eonet.gsfc.nasa.gov/api/v3/events")

    # Where the trained model lives (can be an absolute path in production)
    MODEL_PATH: str = os.getenv("MODEL_PATH", "app/ml/model.pkl")

    # Scheduler behaviour
    FETCH_INTERVAL_HOURS: int = int(os.getenv("FETCH_INTERVAL_HOURS", "6"))
    START_SCHEDULER: str = os.getenv("START_SCHEDULER", "true")

    # App / server settings
    APP_HOST: str = os.getenv("APP_HOST", "0.0.0.0")
    # Support both PORT and APP_PORT environment variable names; PORT is common on PaaS
    APP_PORT: int = int(os.getenv("PORT", os.getenv("APP_PORT", "10000")))

    # Frontend origins for CORS (comma separated), use '*' for dev convenience
    FRONTEND_ORIGINS: str = os.getenv("FRONTEND_ORIGINS", "*")

    # Optional API keys (kept out of source code)
    OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")

    class Config:
        env_file = ".env"
        extra = "ignore"  # Allow extra fields in .env without validation errors


settings = Settings()
