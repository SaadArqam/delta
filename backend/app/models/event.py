from sqlalchemy import Column, String, Float, DateTime, Integer, UniqueConstraint, Index
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    pk_id = Column(Integer, primary_key=True, index=True)
    id = Column(String, index=True) # NASA ID
    category = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    date = Column(DateTime, index=True)
    source = Column(String)

    # Prevent duplicate events for the same ID and Timestamp
    __table_args__ = (
        UniqueConstraint("id", "date", name="_id_date_uc"),
        # Composite index for location-based queries with date filtering
        Index("idx_location_date", "latitude", "longitude", "date"),
        # Index for category filtering with date
        Index("idx_category_date", "category", "date"),
    )