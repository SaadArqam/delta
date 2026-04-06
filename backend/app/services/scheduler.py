import logging
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.nasa_service import fetch_nasa_events
from app.services.db_service import save_events
from app.config import settings

logger = logging.getLogger(__name__)

# Single instance
scheduler = BackgroundScheduler()
_scheduler_started = False

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
    global _scheduler_started
    
    if _scheduler_started:
        logger.info("Scheduler already started, skipping...")
        return
        
    if not scheduler.running:
        # Remove any existing jobs to prevent duplicates
        scheduler.remove_all_jobs()
        
        # Run every N hours based on config
        scheduler.add_job(
            update_events, 
            "interval", 
            hours=settings.FETCH_INTERVAL_HOURS,
            id="nasa_event_update",
            replace_existing=True
        )
        
        # Also run once at startup (with a small delay to ensure app is ready)
        scheduler.add_job(
            update_events, 
            "date", 
            id="startup_update",
            replace_existing=True
        )
        
        scheduler.start()
        _scheduler_started = True
        logger.info("APScheduler background service started.")

def stop_scheduler():
    """Gracefully stop the scheduler."""
    global _scheduler_started
    if scheduler.running:
        scheduler.shutdown()
        _scheduler_started = False
        logger.info("APScheduler background service stopped.")