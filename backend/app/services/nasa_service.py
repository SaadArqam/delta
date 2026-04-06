import requests
from urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter
import logging
from datetime import datetime
from app.config import settings

logger = logging.getLogger(__name__)

def get_session():
    """Create a requests session with retries and timeout settings."""
    session = requests.Session()
    retries = Retry(
        total=3,
        backoff_factor=1,
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET"]
    )
    session.mount("https://", HTTPAdapter(max_retries=retries))
    return session

def fetch_nasa_events():
    """Fetch events from NASA EONET API with retry support."""
    session = get_session()
    try:
        logger.info(f"Fetching NASA events from {settings.NASA_API_URL}...")
        response = session.get(settings.NASA_API_URL, timeout=15)
        response.raise_for_status()
        data = response.json()

        events = []
        for event in data.get("events", []):
            category = event["categories"][0]["title"] if event.get("categories") else "Unknown"
            
            for geo in event.get("geometry", []):
                # NASA date format: "2024-03-24T12:00:00Z"
                date_str = geo["date"].replace("Z", "")
                
                try:
                    event_date = datetime.fromisoformat(date_str)
                except ValueError:
                    logger.warning(f"Invalid date format for event {event.get('id')}: {date_str}")
                    continue

                events.append({
                    "id": event["id"],
                    "category": category,
                    "latitude": geo["coordinates"][1],
                    "longitude": geo["coordinates"][0],
                    "date": event_date,
                    "source": event["sources"][0]["url"] if event.get("sources") else None
                })
        
        logger.info(f"Successfully processed {len(events)} event points from NASA.")
        return events
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error fetching NASA events: {str(e)}")
        return []
    except Exception as e:
        logger.error(f"Unexpected error in NASA service: {str(e)}")
        return []