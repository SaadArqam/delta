import logging
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.nasa_service import fetch_nasa_events
from app.services.db_service import save_events
from app.config import settings

logger = logging.getLogger(__name__)

# Single instance scheduler for the process
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
    """Start the scheduler only if it hasn't been started and START_SCHEDULER is enabled.

    Note: in production you may run multiple app instances; consider running
    scheduler as a separate worker or set START_SCHEDULER=false for web
    instances and true for one dedicated worker.
    """
    global _scheduler_started

    if settings.START_SCHEDULER.lower() not in ("1", "true", "yes"):
        logger.info("START_SCHEDULER disabled; not starting background jobs.")
        return

    if _scheduler_started:
        logger.info("Scheduler already started, skipping...")
        return

    if not scheduler.running:
        # Remove any existing jobs to prevent duplicates
        try:
            scheduler.remove_all_jobs()
        except Exception:
            # ignore if no jobs present
            pass

        # Run every N hours based on config. Use conservative job settings.
        scheduler.add_job(
            update_events,
            "interval",
            hours=settings.FETCH_INTERVAL_HOURS,
            id="nasa_event_update",
            replace_existing=True,
            max_instances=1,
            coalesce=True,
        )

        # Also run once at startup
        scheduler.add_job(
            update_events,
            "date",
            id="startup_update",
            replace_existing=True,
        )

        scheduler.start()
        _scheduler_started = True
        logger.info("APScheduler background service started.")


def stop_scheduler():
    """Gracefully stop the scheduler."""
    global _scheduler_started
    if scheduler.running:
        try:
            scheduler.shutdown(wait=False)
        except Exception as e:
            logger.error(f"Error shutting down scheduler: {e}")
        _scheduler_started = False
        logger.info("APScheduler background service stopped.")