from sqlalchemy import Column, String, Float, DateTime
from app.database import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True)
    category = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    date = Column(DateTime)
    source = Column(String)