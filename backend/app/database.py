from app.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import time
import logging

logger = logging.getLogger(__name__)

DATABASE_URL = settings.DATABASE_URL

# Use pool_pre_ping to avoid stale connections and enable future mode for
# compatibility. Keep echo off for production; LOG can be enabled via env if
# needed later.
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    future=True,
    # connect_args can be added if provider requires SSL settings
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,
)

Base = declarative_base()


def wait_for_db(retries: int = 10, delay: int = 3):
    """Try to connect to the database a few times before giving up.

    This is helpful for platforms like Render where the DB container may
    not be immediately available when the app starts.
    """
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            with engine.connect() as conn:
                conn.execute("SELECT 1")
            logger.info("Database reachable")
            return True
        except Exception as e:
            last_err = e
            logger.warning(f"DB not ready (attempt {attempt}/{retries}): {e}")
            time.sleep(delay)

    logger.critical(f"Could not connect to DB after {retries} attempts: {last_err}")
    return False