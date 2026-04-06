from apscheduler.schedulers.background import BackgroundScheduler
from app.services.nasa_service import fetch_nasa_events
from app.services.db_service import save_events


def update_events():
    print("🔄 Fetching latest NASA events...")
    events = fetch_nasa_events()
    save_events(events)
    print("✅ Events updated in DB")


def start_scheduler():
    scheduler = BackgroundScheduler()

    # Run every 6 hours
    scheduler.add_job(update_events, "interval", hours=6)

    scheduler.start()