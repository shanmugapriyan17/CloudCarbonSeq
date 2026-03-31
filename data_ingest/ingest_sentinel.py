"""
Sentinel-2 Satellite Data Ingestion Script
-------------------------------------------
Downloads Sentinel-2 satellite imagery tiles for specified Areas of Interest (AOI)
using the Copernicus Open Access Hub API and stores them in Azure Data Lake Storage Gen2.

Usage:
    python ingest_sentinel.py --aoi "path/to/aoi.geojson" --start-date 2024-01-01 --end-date 2024-12-31

Azure Integration:
    - Uses azure-storage-file-datalake SDK for ADLS Gen2 upload
    - Credentials via Azure Identity (DefaultAzureCredential)
"""

import os
import json
import logging
import argparse
from datetime import datetime
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Configuration
ADLS_ACCOUNT_NAME = os.getenv("ADLS_ACCOUNT_NAME", "carbonstorage")
ADLS_CONTAINER = os.getenv("ADLS_CONTAINER", "satellite-data")
COPERNICUS_USER = os.getenv("COPERNICUS_USER", "")
COPERNICUS_PASS = os.getenv("COPERNICUS_PASS", "")

# Sentinel-2 bands needed for NDVI
REQUIRED_BANDS = ["B04", "B08"]  # Red, NIR
OPTIONAL_BANDS = ["B02", "B03", "B11", "SCL"]  # Blue, Green, SWIR, Scene Classification


def load_aoi(geojson_path: str) -> dict:
    """Load Area of Interest from GeoJSON file."""
    with open(geojson_path, 'r') as f:
        aoi = json.load(f)
    logger.info(f"Loaded AOI from {geojson_path}")
    return aoi


def search_sentinel2_products(aoi: dict, start_date: str, end_date: str, max_cloud_cover: float = 20.0):
    """
    Search for Sentinel-2 products covering the AOI within the date range.

    In production, this would use the Copernicus Open Access Hub API:
    https://scihub.copernicus.eu/dhus/odata/v1/Products

    Or the Copernicus Data Space Ecosystem API:
    https://dataspace.copernicus.eu/
    """
    logger.info(f"Searching Sentinel-2 products: {start_date} to {end_date}, max cloud cover: {max_cloud_cover}%")

    # --- PRODUCTION CODE ---
    # from sentinelsat import SentinelAPI
    # api = SentinelAPI(COPERNICUS_USER, COPERNICUS_PASS, 'https://apihub.copernicus.eu/apihub')
    # footprint = geojson_to_wkt(aoi)
    # products = api.query(
    #     footprint,
    #     date=(start_date, end_date),
    #     platformname='Sentinel-2',
    #     processinglevel='Level-2A',
    #     cloudcoverpercentage=(0, max_cloud_cover)
    # )
    # return products

    # --- DEMO: Return mock products ---
    products = [
        {
            "id": "S2A_MSIL2A_20240115T053111",
            "title": "S2A_MSIL2A_20240115T053111_N0510_R005_T43QGF",
            "date": "2024-01-15",
            "cloud_cover": 5.2,
            "size_mb": 850,
            "footprint": "POLYGON((88.0 21.5, 89.5 21.5, 89.5 22.5, 88.0 22.5, 88.0 21.5))"
        },
        {
            "id": "S2A_MSIL2A_20240215T053111",
            "title": "S2A_MSIL2A_20240215T053111_N0510_R005_T43QGF",
            "date": "2024-02-15",
            "cloud_cover": 8.7,
            "size_mb": 920,
            "footprint": "POLYGON((88.0 21.5, 89.5 21.5, 89.5 22.5, 88.0 22.5, 88.0 21.5))"
        }
    ]
    logger.info(f"Found {len(products)} Sentinel-2 products")
    return products


def download_product(product: dict, output_dir: str):
    """
    Download a Sentinel-2 product to local storage.

    In production, downloads from Copernicus API and extracts relevant bands.
    """
    product_dir = os.path.join(output_dir, product["id"])
    os.makedirs(product_dir, exist_ok=True)

    logger.info(f"Downloading {product['title']} ({product['size_mb']} MB)")

    # --- PRODUCTION CODE ---
    # api.download(product['id'], directory_path=output_dir)

    # --- DEMO: Create placeholder files ---
    for band in REQUIRED_BANDS + OPTIONAL_BANDS:
        band_file = os.path.join(product_dir, f"{band}.tif")
        Path(band_file).touch()
        logger.info(f"  Downloaded band {band}")

    # Save metadata
    metadata_file = os.path.join(product_dir, "metadata.json")
    with open(metadata_file, 'w') as f:
        json.dump(product, f, indent=2)

    logger.info(f"Product saved to {product_dir}")
    return product_dir


def upload_to_adls(local_path: str, remote_path: str):
    """
    Upload files to Azure Data Lake Storage Gen2.

    Requires:
        pip install azure-storage-file-datalake azure-identity
    """
    logger.info(f"Uploading {local_path} to ADLS: {remote_path}")

    # --- PRODUCTION CODE ---
    # from azure.identity import DefaultAzureCredential
    # from azure.storage.filedatalake import DataLakeServiceClient
    #
    # credential = DefaultAzureCredential()
    # service_client = DataLakeServiceClient(
    #     account_url=f"https://{ADLS_ACCOUNT_NAME}.dfs.core.windows.net",
    #     credential=credential
    # )
    # file_system_client = service_client.get_file_system_client(ADLS_CONTAINER)
    #
    # for root, dirs, files in os.walk(local_path):
    #     for file_name in files:
    #         file_path = os.path.join(root, file_name)
    #         rel_path = os.path.relpath(file_path, local_path)
    #         adls_path = f"{remote_path}/{rel_path}"
    #
    #         file_client = file_system_client.get_file_client(adls_path)
    #         with open(file_path, 'rb') as f:
    #             file_client.upload_data(f, overwrite=True)
    #         logger.info(f"  Uploaded: {adls_path}")

    logger.info(f"Upload complete: {remote_path}")


def main():
    parser = argparse.ArgumentParser(description="Ingest Sentinel-2 satellite data")
    parser.add_argument("--aoi", required=True, help="Path to AOI GeoJSON file")
    parser.add_argument("--start-date", required=True, help="Start date (YYYY-MM-DD)")
    parser.add_argument("--end-date", required=True, help="End date (YYYY-MM-DD)")
    parser.add_argument("--max-cloud-cover", type=float, default=20.0, help="Max cloud cover %")
    parser.add_argument("--output-dir", default="./data/raw", help="Local output directory")
    args = parser.parse_args()

    logger.info("=== Sentinel-2 Data Ingestion Pipeline ===")

    # 1. Load AOI
    aoi = load_aoi(args.aoi)

    # 2. Search for products
    products = search_sentinel2_products(aoi, args.start_date, args.end_date, args.max_cloud_cover)

    # 3. Download and upload each product
    for product in products:
        # Download locally
        local_dir = download_product(product, args.output_dir)

        # Upload to ADLS (partitioned by year/month/region)
        date = datetime.strptime(product["date"], "%Y-%m-%d")
        remote_path = f"raw/{date.year}/{date.strftime('%m')}/{product['id']}"
        upload_to_adls(local_dir, remote_path)

    logger.info(f"=== Ingestion complete: {len(products)} products processed ===")


if __name__ == "__main__":
    main()
