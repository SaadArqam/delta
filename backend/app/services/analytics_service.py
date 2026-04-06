import logging
from typing import Dict, List
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.event import Event

logger = logging.getLogger(__name__)

def get_category_counts(db: Session) -> Dict[str, int]:
    """SQL-based category aggregation for performance."""
    try:
        results = db.query(
            Event.category,
            func.count(Event.pk_id).label("count")
        ).group_by(Event.category).all()
        
        return {r.category: r.count for r in results}
        
    except Exception as e:
        logger.error(f"Error getting category stats: {str(e)}")
        return {}


def get_events_over_time(db: Session) -> Dict[str, int]:
    """SQL-based trend aggregation by date."""
    try:
        # We cast DateTime column to Date for grouping
        results = db.query(
            func.cast(Event.date, func.Date).label("day"),
            func.count(Event.pk_id).label("count")
        ).group_by("day").order_by("day").all()
        
        return {r.day.strftime("%Y-%m-%d"): r.count for r in results}
        
    except Exception as e:
        logger.error(f"Error getting events over time: {str(e)}")
        return {}


def get_recent_events(db: Session, limit: int = 10) -> List[Event]:
    """Retrieve the most recent disaster events as ORM objects."""
    try:
        return db.query(Event).order_by(Event.date.desc()).limit(limit).all()
    except Exception as e:
        logger.error(f"Error getting recent events: {str(e)}")
        return []