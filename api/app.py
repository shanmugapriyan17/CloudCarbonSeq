"""
Cloud-Enabled Satellite-Based Carbon Credit Monitoring System
Main FastAPI Application
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import sys
import os

# Ensure the directory containing app.py is on sys.path so 'routes' can be found
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from routes import regions, dashboard, credits, predict, satellite

app = FastAPI(
    title="Carbon Credit Monitoring API",
    description="Cloud-Enabled Satellite-Based Carbon Credit Monitoring and Estimation System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health check MUST be registered before the catch-all SPA route ──
@app.get("/health", tags=["Health"])
async def health_check():
    """Azure warmup probe hits this. Must return 200 quickly."""
    return {"status": "healthy", "service": "carbon-credit-monitor"}


# Register API route modules
app.include_router(regions.router, tags=["Regions"])
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(credits.router, tags=["Carbon Credits"])
app.include_router(predict.router, tags=["Prediction"])
app.include_router(satellite.router, tags=["Satellite"])


# ── Static file serving for built React SPA ──
static_dir = os.path.join(os.path.dirname(__file__), "static")
assets_dir = os.path.join(static_dir, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")


# ── Catch-all: serve React SPA index.html for any non-API route ──
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    try:
        # Don't intercept /api/* routes
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")

        file_path = os.path.join(static_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)

        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)

        return {"status": "API is running", "docs": "/docs"}
    except Exception as e:
        import traceback
        return {"CRITICAL_ERROR": str(e), "TRACE": traceback.format_exc()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
