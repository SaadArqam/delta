from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import List, Optional, Dict, Any

class EventBase(BaseModel):
    id: str
    category: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    date: datetime
    source: Optional[str] = None

    @validator('date', pre=True)
    def parse_date(cls, v):
        if isinstance(v, str):
            try:
                return datetime.fromisoformat(v.replace('Z', ''))
            except ValueError:
                raise ValueError('Invalid datetime format')
        return v

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
    risk_score: Optional[float] = Field(None, ge=0, le=100)
    status: str
    message: Optional[str] = None

class CategoryStats(BaseModel):
    category_counts: Dict[str, int]
    total_events: int
    last_updated: datetime

class TrendStats(BaseModel):
    trends: Dict[str, int]
    period_days: int
    total_events: int

class HealthResponse(BaseModel):
    status: str
    db_connection: str
    timestamp: datetime
    scheduler_status: Optional[str] = None

class APIError(BaseModel):
    error: str
    detail: Optional[str] = None
    timestamp: datetime
