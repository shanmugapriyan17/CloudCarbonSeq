"""
Persistent Activity Database
------------------------------
Uses SQLite to store REAL system events permanently on the server.
Every satellite scan, credit calculation, and ML prediction is logged here.
These logs are visible in Azure Portal → Log Stream and App Insights.
"""

import sqlite3
import logging
import os
from datetime import datetime, timezone
from typing import List, Optional

logger = logging.getLogger(__name__)

# Store DB next to app.py so it persists across restarts on Azure
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "events.db")


def init_db():
    """Create the events table if it doesn't exist. Called at app startup."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type  TEXT    NOT NULL,
            region_name TEXT,
            message     TEXT    NOT NULL,
            severity    TEXT    NOT NULL DEFAULT 'OK',
            source      TEXT    NOT NULL DEFAULT 'SYSTEM',
            created_at  TEXT    NOT NULL
        )
    """)
    # Seed with a startup event
    cur.execute("""
        INSERT INTO events (event_type, region_name, message, severity, source, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        "SYSTEM",
        None,
        "CloudCarbonSeq API server started — all monitoring pipelines active",
        "OK",
        "APP_SERVICE",
        datetime.now(timezone.utc).isoformat(),
    ))
    conn.commit()
    conn.close()
    logger.info("[DB] events.db initialised at %s", DB_PATH)


def log_event(
    event_type: str,
    message: str,
    severity: str = "OK",
    region_name: Optional[str] = None,
    source: str = "PIPELINE",
):
    """
    Write a real event to the database.
    Called automatically by satellite scans, credit calculations, and ML runs.
    """
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO events (event_type, region_name, message, severity, source, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            event_type.upper(),
            region_name,
            message,
            severity.upper(),
            source,
            datetime.now(timezone.utc).isoformat(),
        ))
        conn.commit()
        conn.close()
        logger.info("[DB] Event logged: [%s] %s", event_type, message)
    except Exception as e:
        logger.error("[DB] Failed to log event: %s", str(e))


def get_recent_events(limit: int = 30) -> List[dict]:
    """Return the most recent events from the database."""
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("""
            SELECT id, event_type, region_name, message, severity, source, created_at
            FROM events
            ORDER BY id DESC
            LIMIT ?
        """, (limit,))
        rows = [dict(r) for r in cur.fetchall()]
        conn.close()
        return rows
    except Exception as e:
        logger.error("[DB] Failed to get events: %s", str(e))
        return []


def get_event_count() -> int:
    """Return total number of events stored."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM events")
        count = cur.fetchone()[0]
        conn.close()
        return count
    except Exception:
        return 0
