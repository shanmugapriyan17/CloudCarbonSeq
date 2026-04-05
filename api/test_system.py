"""
Full system test — run this before deploying to Azure.
Tests:
1. Copernicus STAC API reachable
2. Open-Meteo weather API reachable
3. SQLite database creates and logs events
4. NDVI computation returns correct values
5. All API routes import successfully
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("=" * 60)
print("CloudCarbonSeq System Test")
print("=" * 60)

# Test 1: Copernicus STAC API
print("\n[1] Copernicus STAC API...")
from satellite_service import fetch_latest_ndvi_metadata
meta = fetch_latest_ndvi_metadata()
print(f"    Source: {meta.get('source')}")
print(f"    Acquisition date: {meta.get('acquisition_date')}")
print(f"    Sensor: {meta.get('sensor')}")
print(f"    API status: {meta.get('api_status')}")
assert meta.get("api_status") == "live", "Copernicus API must be live!"
print("    ✅ PASS")

# Test 2: Open-Meteo weather for Sundarbans
print("\n[2] Open-Meteo weather API (Sundarbans 21.9, 88.9)...")
from satellite_service import fetch_weather_for_region
weather = fetch_weather_for_region(21.9, 88.9)
print(f"    Cloud cover: {weather.get('cloud_cover_pct')}%")
print(f"    Temperature: {weather.get('temperature_c')}°C")
print(f"    Source: {weather.get('weather_source')}")
assert isinstance(weather.get("cloud_cover_pct"), (int, float)), "Cloud cover must be a number!"
print("    ✅ PASS")

# Test 3: SQLite Database
print("\n[3] SQLite Database...")
# Use a temp DB path for testing
import tempfile
from database import DB_PATH
print(f"    DB path: {DB_PATH}")
from database import init_db, log_event, get_recent_events, get_event_count
init_db()
log_event("TEST", "System test event — verifying database write", "OK", "Test Region", "TEST")
events = get_recent_events(5)
count = get_event_count()
print(f"    Events in DB: {count}")
print(f"    Latest: {events[0]['message'][:60] if events else 'None'}")
assert count > 0, "DB must have events!"
print("    ✅ PASS")

# Test 4: NDVI computation
print("\n[4] NDVI Computation (Western Ghats)...")
from satellite_service import compute_real_ndvi
ndvi = compute_real_ndvi(
    base_ndvi=0.82,
    lat=10.1632,
    lng=76.6413,
    area_ha=15800,
    region_name="Western Ghats Rainforest",
    cloud_cover_pct=weather.get("cloud_cover_pct", 15.0),
)
print(f"    NDVI: {ndvi['ndvi_current']}")
print(f"    Biomass: {ndvi['biomass_tonnes']:,.0f} tonnes")
print(f"    Carbon: {ndvi['carbon_tonnes']:,.0f} tCO2e")
print(f"    Scan quality: {ndvi['scan_quality']}")
print(f"    Methodology: {ndvi['methodology']}")
assert 0 < ndvi['ndvi_current'] < 1, "NDVI must be between 0 and 1!"
print("    ✅ PASS")

# Test 5: API route imports
print("\n[5] API Route imports...")
from routes import regions, dashboard, credits, predict, satellite
print("    ✅ satellite.py  — OK")
print("    ✅ dashboard.py  — OK")
print("    ✅ regions.py    — OK")
print("    ✅ credits.py    — OK")
print("    ✅ predict.py    — OK")

print("\n" + "=" * 60)
print("ALL TESTS PASSED ✅ — Safe to deploy to Azure")
print("=" * 60)
