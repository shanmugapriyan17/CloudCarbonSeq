"""
Pydantic data models for the Carbon Credit Monitoring System.
"""
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Coordinates(BaseModel):
    lat: float
    lng: float


class Region(BaseModel):
    id: str
    name: str
    state: str
    area_hectares: float
    coordinates: Coordinates
    forest_type: str
    ndvi_current: float
    biomass_tonnes: float
    carbon_tonnes: float
    carbon_credits: float
    status: str  # "healthy", "moderate", "at_risk"
    last_updated: str


class TimeSeriesPoint(BaseModel):
    date: str
    ndvi: float
    biomass: float
    carbon: float
    credits: float


class RegionTimeSeries(BaseModel):
    region_id: str
    region_name: str
    data: List[TimeSeriesPoint]


class DashboardSummary(BaseModel):
    total_carbon_absorbed: float
    total_credits_generated: float
    regions_monitored: int
    active_alerts: int
    carbon_change_percent: float
    credits_change_percent: float
    monthly_carbon: List[dict]
    region_distribution: List[dict]


class CarbonCredit(BaseModel):
    id: str
    region_id: str
    region_name: str
    date_generated: str
    credits_amount: float
    status: str  # "verified", "pending", "retired"
    methodology: str
    vintage_year: int
    buyer: Optional[str] = None


class CreditHistory(BaseModel):
    month: str
    credits_generated: float
    credits_verified: float
    credits_retired: float


class NDVIData(BaseModel):
    region_id: str
    date: str
    mean_ndvi: float
    min_ndvi: float
    max_ndvi: float
    std_ndvi: float
    pixel_count: int
    cloud_cover_pct: float


class PredictionRequest(BaseModel):
    ndvi_mean: float
    ndvi_max: float
    ndvi_std: float
    area_hectares: float
    forest_type: str
    latitude: float
    longitude: float


class PredictionResponse(BaseModel):
    biomass_tonnes_per_ha: float
    total_biomass_tonnes: float
    carbon_tonnes: float
    co2_equivalent: float
    carbon_credits: float
    confidence: float
    model_version: str


class ActivityItem(BaseModel):
    id: str
    type: str  # "alert", "credit", "scan", "model"
    message: str
    timestamp: str
    severity: str  # "info", "warning", "success", "error"
