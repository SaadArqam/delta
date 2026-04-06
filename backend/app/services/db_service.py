from app.database import SessionLocal
from app.models.event import Event


def save_events(events):
    db = SessionLocal()

    for e in events:
        exists = db.query(Event).filter(Event.id == e["id"]).first()

        if not exists:
            db_event = Event(
                id=e["id"],
                category=e["category"],
                latitude=e["latitude"],
                longitude=e["longitude"],
                date=e["date"],
                source=e["source"]
            )
            db.add(db_event)

    db.commit()
    db.close()


def get_events():
    db = SessionLocal()
    events = db.query(Event).all()
    db.close()

    return [
        {
            "id": e.id,
            "category": e.category,
            "latitude": e.latitude,
            "longitude": e.longitude,
            "date": e.date
        }
        for e in events
    ]