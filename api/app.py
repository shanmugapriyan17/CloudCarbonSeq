"""
Cloud-Enabled Satellite-Based Carbon Credit Monitoring System
Main FastAPI Application — with Azure Application Insights logging
"""
import sys
import os
import logging

# ── Azure Application Insights Logging ────────────────────────────────────────
# Sends ALL Python logs to Azure Portal → Application Insights → Logs → traces
# Connection string is read from environment variable (set in Azure App Service)
APPINSIGHTS_CONN = os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING", "")
if APPINSIGHTS_CONN:
    try:
        from opencensus.ext.azure.log_exporter import AzureLogHandler
        azure_handler = AzureLogHandler(connection_string=APPINSIGHTS_CONN)
        logging.getLogger().addHandler(azure_handler)
        logging.getLogger().setLevel(logging.INFO)
        logging.info("[APP-INSIGHTS] Azure Application Insights logging enabled")
    except Exception as _ai_err:
        logging.basicConfig(level=logging.INFO)
        logging.warning("[APP-INSIGHTS] Could not enable Azure logging: %s", _ai_err)
else:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    )
    logging.info("[APP-INSIGHTS] Running without App Insights (local mode)")

logger = logging.getLogger(__name__)

# ── FastAPI setup ──────────────────────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from routes import regions, dashboard, credits, predict, satellite

app = FastAPI(
    title="Carbon Credit Monitoring API",
    description="Cloud-Enabled Satellite-Based Carbon Credit Monitoring — Real satellite data via Copernicus ESA",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    """Initialise the SQLite event database when the server starts."""
    from database import init_db, log_event
    init_db()
    log_event(
        event_type="SYSTEM",
        message="CloudCarbonSeq v2.0 started — Copernicus STAC + Open-Meteo integrations active",
        severity="OK",
        source="APP_SERVICE",
    )
    logger.info("[STARTUP] Database initialised. Server is ready.")


@app.get("/health", tags=["Health"])
async def health_check():
    """Azure warmup probe — returns real server status."""
    from database import get_event_count
    from datetime import datetime, timezone
    event_count = get_event_count()
    logger.info("[HEALTH] Health check called — %d events in DB", event_count)
    return {
        "status": "healthy",
        "service": "cloudcarbonseq-api",
        "version": "2.0.0",
        "server_time_utc": datetime.now(timezone.utc).isoformat(),
        "events_logged": event_count,
        "integrations": {
            "copernicus_stac": "active",
            "open_meteo": "active",
            "sqlite_db": "active",
            "app_insights": "active" if APPINSIGHTS_CONN else "disabled (local)",
        },
    }


# Register API route modules
app.include_router(regions.router, tags=["Regions"])
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(credits.router, tags=["Carbon Credits"])
app.include_router(predict.router, tags=["Prediction"])
app.include_router(satellite.router, tags=["Satellite"])

# ── Static file serving for built React SPA ───────────────────────────────────
static_dir = os.path.join(os.path.dirname(__file__), "static")
assets_dir = os.path.join(static_dir, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail="API route not found")
    file_path = os.path.join(static_dir, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    index_path = os.path.join(static_dir, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"status": "API is running", "docs": "/docs"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
