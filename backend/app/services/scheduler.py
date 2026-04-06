import logging
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.nasa_service import fetch_nasa_events
from app.services.db_service import save_events
from app.config import settings

logger = logging.getLogger(__name__)

# Single instance
scheduler = BackgroundScheduler()

def update_events():
    """Background job for events updates."""
    try:
        logger.info("Starting background event refresh...")
        events = fetch_nasa_events()
        save_events(events)
        logger.info("Background event refresh completed.")
    except Exception as e:
        logger.error(f"Error in scheduler job: {str(e)}")

def start_scheduler():
    """Start the scheduler only if it hasn't been started."""
    if not scheduler.running:
        # Run every N hours based on config
        scheduler.add_job(
            update_events, 
            "interval", 
            hours=settings.FETCH_INTERVAL_HOURS,
            id="nasa_event_update"
        )
        
        # Also run once at startup
        scheduler.add_job(update_events, "date", id="startup_update")
        
        scheduler.start()
        logger.info("APScheduler background service started.")

def stop_scheduler():
    """Gracefully stop the scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("APScheduler background service stopped.")