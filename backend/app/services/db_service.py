import logging
from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_
from sqlalchemy.dialects.postgresql import insert

from app.database import SessionLocal
from app.models.event import Event

logger = logging.getLogger(__name__)

def get_db():
    """FastAPI Dependency for database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def save_events(events: List[dict]):
    """Efficiently save multiple events by using bulk PostgreSQL insert."""
    if not events:
        logger.info("No events to save.")
        return

    db = SessionLocal()
    try:
        # PostgreSQL-specific bulk insert with "on conflict do nothing"
        # This requires the UniqueConstraint("_id_date_uc") in the model
        stmt = insert(Event).values(events)
        stmt = stmt.on_conflict_do_nothing(index_elements=["id", "date"])
        
        db.execute(stmt)
        db.commit()
        logger.info(f"Bulk insert of {len(events)} events completed.")
    except Exception as e:
        logger.error(f"Error saving events: {str(e)}")
        db.rollback()
    finally:
        db.close()

def get_recent_events_db(db: Session, limit: int = 500, category: Optional[str] = None):
    """Query events with filtering and limits. Internal helper for API."""
    query = db.query(Event)
    
    if category:
        query = query.filter(Event.category == category)
    
    return query.order_by(Event.date.desc()).limit(limit).all()

def get_events_within_range(db: Session, lat: float, lon: float, radius_km: float, cutoff_date: datetime):
    """
    Optimized query using a bounding box pre-filter before haversine calculation.
    This reduces the number of records retrieved from thousands to a handful.
    """
    # 1 degree lat ~ 111km, 1 degree lon ~ 111km * cos(lat)
    # Using roughly 1 degree per 100km for the bounding box
    delta = radius_km / 100.0
    
    query = db.query(Event).filter(
        and_(
            Event.date >= cutoff_date,
            Event.latitude.between(lat - delta, lat + delta),
            Event.longitude.between(lon - delta, lon + delta)
        )
    )
    
    return query.all()