from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class EventBase(BaseModel):
    id: str
    category: str
    latitude: float
    longitude: float
    date: datetime
    source: Optional[str] = None

class EventResponse(EventBase):
    class Config:
        from_attributes = True

class RiskRequest(BaseModel):
    lat: float = Field(..., ge=-90, le=90, description="Latitude point")
    lon: float = Field(..., ge=-180, le=180, description="Longitude point")

class RiskResponse(BaseModel):
    lat: float
    lon: float
    event_count_30d: int
    risk_score: Optional[float]
    status: str

class CategoryStats(BaseModel):
    category_counts: dict[str, int]

class TrendStats(BaseModel):
    trends: dict[str, int]
