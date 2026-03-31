"""
Prediction API routes — on-demand biomass/carbon estimation.
"""
from fastapi import APIRouter
from models import PredictionRequest, PredictionResponse
import numpy as np

router = APIRouter()

# Conversion factors
CARBON_FRACTION = 0.47
CO2E_FACTOR = 3.667  # 44/12


@router.post("/api/predict", response_model=PredictionResponse)
async def predict_carbon(request: PredictionRequest):
    """
    Predict biomass and carbon credits from NDVI features.
    Uses a simplified model for demo; in production, this calls Azure ML endpoint.
    """
    # Simplified biomass estimation model
    # In production: call Azure ML endpoint with azureml-core SDK
    base_biomass = 280 * request.ndvi_mean
    type_factor = {
        "Tropical Evergreen": 1.3,
        "Tropical Wet Evergreen": 1.35,
        "Tropical Moist": 1.15,
        "Mangrove": 0.95,
        "Deciduous": 0.85,
        "Dry Deciduous": 0.70,
        "Moist Deciduous": 0.90,
        "Alpine": 0.50,
        "Alpine Meadow": 0.35,
    }.get(request.forest_type, 1.0)

    biomass_per_ha = base_biomass * type_factor * (1 + 0.1 * request.ndvi_max)
    biomass_per_ha += np.random.normal(0, 5)  # add some noise
    biomass_per_ha = max(10, biomass_per_ha)

    total_biomass = biomass_per_ha * request.area_hectares
    carbon = total_biomass * CARBON_FRACTION
    co2e = carbon * CO2E_FACTOR
    credits = co2e  # 1 credit = 1 tCO2e

    # Confidence based on data quality indicators
    confidence = min(0.95, 0.7 + 0.2 * request.ndvi_mean - 0.1 * request.ndvi_std)

    return PredictionResponse(
        biomass_tonnes_per_ha=round(biomass_per_ha, 2),
        total_biomass_tonnes=round(total_biomass, 2),
        carbon_tonnes=round(carbon, 2),
        co2_equivalent=round(co2e, 2),
        carbon_credits=round(credits, 2),
        confidence=round(confidence, 3),
        model_version="2.3-demo"
    )
