"""
Feature Aggregation Script
---------------------------
Computes zonal statistics (mean NDVI, percentiles, etc.) for forest parcel polygons
and exports the results as Parquet files for ML model training.

Usage:
    python aggregate_features.py --ndvi "data/processed/ndvi.tif" --parcels "data/parcels.geojson"

Azure Integration:
    - Reads NDVI rasters from Azure Data Lake Storage Gen2
    - Outputs Parquet files back to ADLS for Azure ML consumption
"""

import os
import json
import logging
import argparse
import numpy as np
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def load_parcels(geojson_path: str) -> list:
    """Load forest parcel polygons from a GeoJSON file."""
    logger.info(f"Loading parcels from: {geojson_path}")

    # --- PRODUCTION CODE ---
    # import geopandas as gpd
    # parcels = gpd.read_file(geojson_path)
    # return parcels

    # --- DEMO: Generate synthetic parcels ---
    parcels = []
    for i in range(20):
        parcels.append({
            "id": f"parcel_{i+1:03d}",
            "name": f"Forest Parcel {i+1}",
            "area_hectares": np.random.uniform(50, 5000),
            "forest_type": np.random.choice([
                "Tropical Evergreen", "Deciduous", "Mangrove",
                "Tropical Moist", "Alpine", "Moist Deciduous"
            ]),
            "latitude": np.random.uniform(8, 30),
            "longitude": np.random.uniform(70, 97)
        })
    logger.info(f"Loaded {len(parcels)} parcels")
    return parcels


def compute_zonal_stats(parcels: list, ndvi_path: str) -> list:
    """
    Compute zonal statistics for each parcel polygon over the NDVI raster.

    Statistics computed:
    - mean, median, std NDVI
    - 25th and 75th percentiles
    - valid pixel count
    - forest cover fraction (pixels with NDVI > 0.3)
    """
    logger.info(f"Computing zonal statistics from: {ndvi_path}")

    # --- PRODUCTION CODE ---
    # import rasterstats
    # stats = rasterstats.zonal_stats(
    #     parcels_gdf,
    #     ndvi_path,
    #     stats=['mean', 'median', 'std', 'min', 'max', 'count',
    #            'percentile_25', 'percentile_75']
    # )

    # --- DEMO: Generate synthetic stats ---
    results = []
    for parcel in parcels:
        base_ndvi = np.random.uniform(0.4, 0.85)
        stats = {
            "parcel_id": parcel["id"],
            "parcel_name": parcel["name"],
            "area_hectares": parcel["area_hectares"],
            "forest_type": parcel["forest_type"],
            "latitude": parcel["latitude"],
            "longitude": parcel["longitude"],
            "ndvi_mean": round(base_ndvi, 4),
            "ndvi_median": round(base_ndvi + np.random.normal(0, 0.02), 4),
            "ndvi_std": round(np.random.uniform(0.03, 0.1), 4),
            "ndvi_min": round(base_ndvi - np.random.uniform(0.1, 0.3), 4),
            "ndvi_max": round(min(0.95, base_ndvi + np.random.uniform(0.05, 0.15)), 4),
            "ndvi_p25": round(base_ndvi - np.random.uniform(0.02, 0.08), 4),
            "ndvi_p75": round(base_ndvi + np.random.uniform(0.02, 0.08), 4),
            "valid_pixel_count": int(np.random.uniform(10000, 500000)),
            "forest_cover_fraction": round(np.random.uniform(0.6, 0.95), 4),
            "date": datetime.now().strftime("%Y-%m-%d")
        }
        results.append(stats)
        logger.info(f"  {parcel['name']}: NDVI mean={stats['ndvi_mean']:.4f}")

    return results


def save_features(features: list, output_path: str):
    """Save computed features as Parquet (or CSV/JSON for demo)."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    logger.info(f"Saving {len(features)} feature records to: {output_path}")

    # --- PRODUCTION CODE ---
    # import pandas as pd
    # df = pd.DataFrame(features)
    # df.to_parquet(output_path, index=False)

    # --- DEMO: Save as JSON ---
    json_path = output_path.replace('.parquet', '.json')
    with open(json_path, 'w') as f:
        json.dump(features, f, indent=2)

    logger.info(f"Features saved: {len(features)} records")


def upload_to_adls(local_path: str, remote_path: str):
    """Upload aggregated features to Azure Data Lake Storage Gen2."""
    logger.info(f"Uploading to ADLS: {remote_path}")

    # --- PRODUCTION CODE ---
    # from azure.identity import DefaultAzureCredential
    # from azure.storage.filedatalake import DataLakeServiceClient
    # credential = DefaultAzureCredential()
    # service_client = DataLakeServiceClient(
    #     account_url=f"https://{ADLS_ACCOUNT_NAME}.dfs.core.windows.net",
    #     credential=credential
    # )
    # ... upload logic ...

    logger.info(f"Upload complete: {remote_path}")


def main():
    parser = argparse.ArgumentParser(description="Aggregate NDVI features for forest parcels")
    parser.add_argument("--ndvi", required=True, help="Path to NDVI raster (GeoTIFF)")
    parser.add_argument("--parcels", required=True, help="Path to parcels GeoJSON")
    parser.add_argument("--output", default="./data/features/parcels_features.parquet",
                        help="Output path for feature parquet")
    args = parser.parse_args()

    logger.info("=== Feature Aggregation Pipeline ===")

    # 1. Load parcels
    parcels = load_parcels(args.parcels)

    # 2. Compute zonal stats
    features = compute_zonal_stats(parcels, args.ndvi)

    # 3. Save and upload
    save_features(features, args.output)

    date = datetime.now()
    remote_path = f"features/{date.year}/{date.strftime('%m')}/parcels_features.parquet"
    upload_to_adls(args.output, remote_path)

    logger.info("=== Feature aggregation complete ===")


if __name__ == "__main__":
    main()
