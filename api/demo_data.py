"""
Demo data generator for the Carbon Credit Monitoring System.
Generates realistic mock data for 20 Indian forest regions with 2 years of monthly data.
"""
import random
import math
import numpy as np
from datetime import datetime, timedelta


random.seed(42)
np.random.seed(42)


FOREST_REGIONS = [
    {"id": "reg-001", "name": "Sundarbans Mangrove Forest", "state": "West Bengal", "lat": 21.9497, "lng": 88.8987, "area": 4262, "type": "Mangrove", "base_ndvi": 0.72},
    {"id": "reg-002", "name": "Western Ghats Rainforest", "state": "Kerala", "lat": 10.1632, "lng": 76.6413, "area": 15800, "type": "Tropical Evergreen", "base_ndvi": 0.82},
    {"id": "reg-003", "name": "Jim Corbett National Park", "state": "Uttarakhand", "lat": 29.5300, "lng": 78.7747, "area": 1318, "type": "Deciduous", "base_ndvi": 0.68},
    {"id": "reg-004", "name": "Kaziranga National Park", "state": "Assam", "lat": 26.5775, "lng": 93.1711, "area": 1030, "type": "Tropical Moist", "base_ndvi": 0.75},
    {"id": "reg-005", "name": "Nilgiri Biosphere Reserve", "state": "Tamil Nadu", "lat": 11.4000, "lng": 76.5000, "area": 5520, "type": "Tropical Evergreen", "base_ndvi": 0.79},
    {"id": "reg-006", "name": "Gir Forest", "state": "Gujarat", "lat": 21.1243, "lng": 70.7932, "area": 1412, "type": "Dry Deciduous", "base_ndvi": 0.55},
    {"id": "reg-007", "name": "Namdapha National Park", "state": "Arunachal Pradesh", "lat": 27.4833, "lng": 96.3833, "area": 1985, "type": "Tropical Evergreen", "base_ndvi": 0.85},
    {"id": "reg-008", "name": "Silent Valley", "state": "Kerala", "lat": 11.0833, "lng": 76.4333, "area": 237, "type": "Tropical Evergreen", "base_ndvi": 0.88},
    {"id": "reg-009", "name": "Bandipur National Park", "state": "Karnataka", "lat": 11.6689, "lng": 76.6338, "area": 874, "type": "Deciduous", "base_ndvi": 0.65},
    {"id": "reg-010", "name": "Manas National Park", "state": "Assam", "lat": 26.6594, "lng": 90.9470, "area": 950, "type": "Tropical Moist", "base_ndvi": 0.73},
    {"id": "reg-011", "name": "Periyar Tiger Reserve", "state": "Kerala", "lat": 9.4670, "lng": 77.1669, "area": 925, "type": "Tropical Evergreen", "base_ndvi": 0.80},
    {"id": "reg-012", "name": "Satpura National Park", "state": "Madhya Pradesh", "lat": 22.5681, "lng": 77.8899, "area": 1427, "type": "Deciduous", "base_ndvi": 0.62},
    {"id": "reg-013", "name": "Pachmarhi Biosphere Reserve", "state": "Madhya Pradesh", "lat": 22.4675, "lng": 78.4349, "area": 4981, "type": "Moist Deciduous", "base_ndvi": 0.64},
    {"id": "reg-014", "name": "Nanda Devi Biosphere", "state": "Uttarakhand", "lat": 30.4000, "lng": 79.9000, "area": 5860, "type": "Alpine", "base_ndvi": 0.45},
    {"id": "reg-015", "name": "Great Nicobar Biosphere", "state": "Andaman & Nicobar", "lat": 7.0000, "lng": 93.8500, "area": 885, "type": "Tropical Wet Evergreen", "base_ndvi": 0.87},
    {"id": "reg-016", "name": "Agasthyamalai Biosphere", "state": "Tamil Nadu", "lat": 8.6333, "lng": 77.2333, "area": 3500, "type": "Tropical Evergreen", "base_ndvi": 0.78},
    {"id": "reg-017", "name": "Simlipal Biosphere Reserve", "state": "Odisha", "lat": 21.8281, "lng": 86.3746, "area": 4374, "type": "Tropical Moist", "base_ndvi": 0.71},
    {"id": "reg-018", "name": "Dibru-Saikhowa National Park", "state": "Assam", "lat": 27.6000, "lng": 95.4167, "area": 765, "type": "Tropical Moist", "base_ndvi": 0.74},
    {"id": "reg-019", "name": "Valley of Flowers", "state": "Uttarakhand", "lat": 30.7280, "lng": 79.6050, "area": 87, "type": "Alpine Meadow", "base_ndvi": 0.50},
    {"id": "reg-020", "name": "Bhitarkanika Mangroves", "state": "Odisha", "lat": 20.7333, "lng": 87.0000, "area": 672, "type": "Mangrove", "base_ndvi": 0.70},
]

# Biomass conversion factors
BIOMASS_PER_NDVI_FACTOR = 280  # tonnes/ha per NDVI unit (approximate)
CARBON_FRACTION = 0.47  # fraction of biomass that is carbon
CO2E_FACTOR = 3.667  # CO2 equivalent factor (44/12)

STATUSES = ["healthy", "healthy", "healthy", "moderate", "moderate", "at_risk"]
CREDIT_STATUSES = ["verified", "verified", "verified", "pending", "retired"]
METHODOLOGIES = ["VCS VM0015", "VCS VM0007", "Gold Standard AR", "CDM AR-AM0014"]
BUYERS = ["Microsoft", "Google", "Amazon", "Shell", "BP", "TotalEnergies", "Salesforce", "Stripe", "Shopify", None, None]


def seasonal_ndvi(base_ndvi: float, month: int, year_offset: int = 0) -> float:
    """Generate seasonal NDVI variation (higher in monsoon, lower in dry season)."""
    seasonal = 0.08 * math.sin(2 * math.pi * (month - 3) / 12)  # peak around monsoon
    trend = 0.005 * year_offset  # slight upward trend
    noise = np.random.normal(0, 0.02)
    return max(0.1, min(0.95, base_ndvi + seasonal + trend + noise))


def ndvi_to_biomass(ndvi: float, area_hectares: float) -> float:
    """Convert NDVI to aboveground biomass (tonnes)."""
    biomass_per_ha = BIOMASS_PER_NDVI_FACTOR * ndvi * (0.8 + 0.4 * np.random.random())
    return round(biomass_per_ha * area_hectares, 2)


def biomass_to_carbon(biomass: float) -> float:
    """Convert biomass to carbon (tonnes)."""
    return round(biomass * CARBON_FRACTION, 2)


def carbon_to_credits(carbon: float) -> float:
    """Convert carbon to CO2e credits (1 credit = 1 tCO2e)."""
    co2e = carbon * CO2E_FACTOR
    return round(co2e, 2)


def generate_regions():
    """Generate region data with current stats."""
    regions = []
    for r in FOREST_REGIONS:
        ndvi = seasonal_ndvi(r["base_ndvi"], datetime.now().month)
        biomass = ndvi_to_biomass(ndvi, r["area"])
        carbon = biomass_to_carbon(biomass)
        credits = carbon_to_credits(carbon)
        status = random.choice(STATUSES)

        regions.append({
            "id": r["id"],
            "name": r["name"],
            "state": r["state"],
            "area_hectares": r["area"],
            "coordinates": {"lat": r["lat"], "lng": r["lng"]},
            "forest_type": r["type"],
            "ndvi_current": round(ndvi, 4),
            "biomass_tonnes": biomass,
            "carbon_tonnes": carbon,
            "carbon_credits": credits,
            "status": status,
            "last_updated": datetime.now().strftime("%Y-%m-%d")
        })
    return regions


def generate_timeseries(region_id: str, months: int = 24):
    """Generate monthly timeseries data for a region."""
    region = next((r for r in FOREST_REGIONS if r["id"] == region_id), FOREST_REGIONS[0])
    data = []
    start = datetime.now() - timedelta(days=30 * months)

    for i in range(months):
        date = start + timedelta(days=30 * i)
        ndvi = seasonal_ndvi(region["base_ndvi"], date.month, i // 12)
        biomass = ndvi_to_biomass(ndvi, region["area"])
        carbon = biomass_to_carbon(biomass)
        credits = carbon_to_credits(carbon)

        data.append({
            "date": date.strftime("%Y-%m"),
            "ndvi": round(ndvi, 4),
            "biomass": biomass,
            "carbon": carbon,
            "credits": credits
        })
    return {
        "region_id": region_id,
        "region_name": region["name"],
        "data": data
    }


def generate_dashboard_summary():
    """Generate dashboard summary statistics."""
    regions = generate_regions()
    total_carbon = sum(r["carbon_tonnes"] for r in regions)
    total_credits = sum(r["carbon_credits"] for r in regions)

    # Monthly carbon data (last 12 months)
    monthly_carbon = []
    for i in range(12):
        date = datetime.now() - timedelta(days=30 * (11 - i))
        month_total = total_carbon * (0.85 + 0.3 * np.random.random()) / 12
        monthly_carbon.append({
            "month": date.strftime("%b %Y"),
            "carbon": round(month_total, 2),
            "credits": round(month_total * CO2E_FACTOR, 2)
        })

    # Region distribution
    region_dist = [
        {"region": r["name"][:20], "carbon": r["carbon_tonnes"], "state": r["state"]}
        for r in sorted(regions, key=lambda x: x["carbon_tonnes"], reverse=True)[:10]
    ]

    return {
        "total_carbon_absorbed": round(total_carbon, 2),
        "total_credits_generated": round(total_credits, 2),
        "regions_monitored": len(regions),
        "active_alerts": random.randint(2, 5),
        "carbon_change_percent": round(random.uniform(2.5, 8.5), 1),
        "credits_change_percent": round(random.uniform(3.0, 12.0), 1),
        "monthly_carbon": monthly_carbon,
        "region_distribution": region_dist
    }


def generate_credits(count: int = 50):
    """Generate carbon credit records."""
    credits = []
    for i in range(count):
        region = random.choice(FOREST_REGIONS)
        date = datetime.now() - timedelta(days=random.randint(1, 365))
        amount = round(random.uniform(50, 5000), 2)
        status = random.choice(CREDIT_STATUSES)

        credits.append({
            "id": f"CC-{2024+i//25}-{str(i+1).zfill(4)}",
            "region_id": region["id"],
            "region_name": region["name"],
            "date_generated": date.strftime("%Y-%m-%d"),
            "credits_amount": amount,
            "status": status,
            "methodology": random.choice(METHODOLOGIES),
            "vintage_year": date.year,
            "buyer": random.choice(BUYERS) if status == "retired" else None
        })
    return sorted(credits, key=lambda x: x["date_generated"], reverse=True)


def generate_credit_history():
    """Generate monthly credit generation history."""
    history = []
    for i in range(12):
        date = datetime.now() - timedelta(days=30 * (11 - i))
        generated = round(random.uniform(5000, 25000), 2)
        verified = round(generated * random.uniform(0.7, 0.95), 2)
        retired = round(verified * random.uniform(0.3, 0.6), 2)

        history.append({
            "month": date.strftime("%b %Y"),
            "credits_generated": generated,
            "credits_verified": verified,
            "credits_retired": retired
        })
    return history


def generate_ndvi_data(region_id: str = None):
    """Generate NDVI measurement data."""
    regions_to_use = [next((r for r in FOREST_REGIONS if r["id"] == region_id), FOREST_REGIONS[0])] if region_id else FOREST_REGIONS[:5]
    data = []

    for region in regions_to_use:
        for i in range(12):
            date = datetime.now() - timedelta(days=30 * (11 - i))
            mean_ndvi = seasonal_ndvi(region["base_ndvi"], date.month)

            data.append({
                "region_id": region["id"],
                "date": date.strftime("%Y-%m-%d"),
                "mean_ndvi": round(mean_ndvi, 4),
                "min_ndvi": round(mean_ndvi - random.uniform(0.05, 0.15), 4),
                "max_ndvi": round(mean_ndvi + random.uniform(0.05, 0.1), 4),
                "std_ndvi": round(random.uniform(0.02, 0.08), 4),
                "pixel_count": random.randint(50000, 500000),
                "cloud_cover_pct": round(random.uniform(0, 30), 1)
            })
    return data


def generate_activities(count: int = 15):
    """Generate recent activity items."""
    activity_types = [
        {"type": "scan", "severity": "info", "templates": [
            "Satellite scan completed for {region}",
            "New Sentinel-2 imagery processed for {region}",
            "NDVI calculation updated for {region}"
        ]},
        {"type": "credit", "severity": "success", "templates": [
            "{amount} carbon credits generated for {region}",
            "Credit verification completed — {amount} tCO₂e certified",
            "Carbon credits issued to {buyer} from {region}"
        ]},
        {"type": "alert", "severity": "warning", "templates": [
            "NDVI decline detected in {region} — review recommended",
            "Cloud cover above 50% in {region} — rescheduling scan",
            "Unusual biomass variation in {region}"
        ]},
        {"type": "model", "severity": "info", "templates": [
            "ML model retrained — accuracy improved to {acc}%",
            "Biomass estimation model v{ver} deployed",
            "Batch prediction completed for {count} regions"
        ]}
    ]

    activities = []
    for i in range(count):
        at = random.choice(activity_types)
        template = random.choice(at["templates"])
        region = random.choice(FOREST_REGIONS)
        msg = template.format(
            region=region["name"],
            amount=round(random.uniform(100, 3000), 1),
            buyer=random.choice(["Microsoft", "Google", "Amazon", "Shell"]),
            acc=round(random.uniform(88, 96), 1),
            ver=f"2.{random.randint(1,9)}",
            count=random.randint(10, 20)
        )
        hours_ago = random.randint(1, 72)
        activities.append({
            "id": f"act-{str(i+1).zfill(3)}",
            "type": at["type"],
            "message": msg,
            "timestamp": (datetime.now() - timedelta(hours=hours_ago)).isoformat(),
            "severity": at["severity"]
        })
    return sorted(activities, key=lambda x: x["timestamp"], reverse=True)
