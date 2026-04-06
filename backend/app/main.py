import logging
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, HTTPException, Query, Depends
from sqlalchemy.orm import Session

from app.database import engine, Base
from app.services.nasa_service import fetch_nasa_events
from app.services.feature_engineering import generate_features
from app.services.dataset_builder import build_dataset
from app.ml.train import train_model
from app.ml.predict import predict_risk
from app.services.geo_features import compute_event_count
from app.services.db_service import save_events, get_db, get_recent_events_db, get_events_within_range
from app.services.scheduler import start_scheduler, stop_scheduler
from app.services.analytics_service import (
    get_category_counts,
    get_events_over_time,
    get_recent_events
)
from app.schemas import (
    RiskRequest, 
    RiskResponse, 
    EventResponse, 
    CategoryStats, 
    TrendStats
)

# --- Logging Config ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# --- Lifespan ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup actions
    logger.info("Initializing application services...")
    
    # Ensure tables are created (simple alternative to migrations for this scope)
    Base.metadata.create_all(bind=engine)
    
    start_scheduler()
    yield
    # Shutdown actions
    logger.info("Shutting down application services...")
    stop_scheduler()

app = FastAPI(
    title="AI Disaster Intelligence Platform",
    description="Scalable disaster tracking and risk prediction API.",
    version="1.0.0",
    lifespan=lifespan
)

@app.get("/health", tags=["General"])
def health_check(db: Session = Depends(get_db)):
    """Check system health and database connectivity."""
    try:
        # Simple query to check DB
        db.execute("SELECT 1")
        return {
            "status": "healthy",
            "db_connection": "ok",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        logger.critical(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "db_connection": f"error: {str(e)}",
            "timestamp": datetime.now().isoformat()
        }

@app.get("/", tags=["General"])
def root():
    return {
        "message": "Disaster Intelligence API Running",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.get("/events", response_model=List[EventResponse], tags=["Data"])
def list_events(
    limit: int = 50, 
    category: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    """Retrieve disaster events from the internal database."""
    try:
        return get_recent_events_db(db, limit=limit, category=category)
    except Exception as e:
        logger.error(f"Error listing events: {e}")
        raise HTTPException(status_code=500, detail="Database retrieval failed")

@app.post("/train", tags=["ML"])
def train(db: Session = Depends(get_db)):
    """Manually trigger model training using current data from the database."""
    try:
        # Fetch data for training
        db_events = get_recent_events_db(db, limit=5000)
        
        if len(db_events) < 10:
            logger.info("Insufficient data in DB, fetching from NASA...")
            raw_events = fetch_nasa_events()
            save_events(raw_events)
            db_events = get_recent_events_db(db, limit=5000)
        
        # Convert ORM to dicts for feature engineering service
        events_data = [
            {
                "id": e.id, "category": e.category, 
                "latitude": e.latitude, "longitude": e.longitude, 
                "date": e.date
            } 
            for e in db_events
        ]
        
        features_df = generate_features(events_data)
        dataset = build_dataset(features_df)
        train_model(dataset)

        return {"status": "success", "message": "Model trained successfully", "samples": len(dataset)}
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@app.get("/predict", response_model=RiskResponse, tags=["ML"])
def predict(
    lat: float = Query(..., ge=-90, le=90), 
    lon: float = Query(..., ge=-180, le=180),
    db: Session = Depends(get_db)
):
    """Predict risk score for a specific lat/lon coordinate."""
    try:
        # Optimized: Only fetch events within 500km and last 30 days
        cutoff_date = datetime.now() - timedelta(days=30)
        nearby_events = get_events_within_range(db, lat, lon, radius_km=500, cutoff_date=cutoff_date)
        
        # Convert to dicts for geofeatures (expects dict with 'latitude', 'longitude', 'date')
        events_list = [
            {"latitude": e.latitude, "longitude": e.longitude, "date": e.date}
            for e in nearby_events
        ]

        # Step 2: compute EXACT feature (count events in last 30d within 500km)
        event_count_30d = compute_event_count(events_list, lat, lon)

        # Step 3: current month
        month = datetime.now().month

        # Step 4: predict
        risk_score = predict_risk(event_count_30d, month)

        if risk_score is None:
             return RiskResponse(
                lat=lat, lon=lon, event_count_30d=event_count_30d,
                risk_score=None, status="Model not found. Please run /train first."
             )

        return RiskResponse(
            lat=lat, lon=lon,
            event_count_30d=event_count_30d,
            risk_score=risk_score,
            status="success"
        )
    except Exception as e:
        logger.error(f"Prediction API failed: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed")

@app.get("/analytics/categories", response_model=Dict[str, int], tags=["Analytics"])
def category_stats(db: Session = Depends(get_db)):
    """Group events by category and show counts."""
    return get_category_counts(db)

@app.get("/analytics/trends", tags=["Analytics"])
def trends(db: Session = Depends(get_db)):
    """Retrieve daily event counts for trend analysis."""
    return get_events_over_time(db)

@app.get("/analytics/recent", response_model=List[EventResponse], tags=["Analytics"])
def recent(limit: int = 10, db: Session = Depends(get_db)):
    """List the most recent events found in the system."""
    return get_recent_events(db, limit=limit)