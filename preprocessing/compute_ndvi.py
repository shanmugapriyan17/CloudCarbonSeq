"""
NDVI Computation Script
-----------------------
Reads Sentinel-2 NIR (B08) and Red (B04) band GeoTIFFs, computes NDVI,
applies cloud masking using the SCL band, and saves processed rasters.

Formula: NDVI = (NIR - RED) / (NIR + RED)

Usage:
    python compute_ndvi.py --input-dir "data/raw/S2A_..." --output-dir "data/processed"

Azure Integration:
    - Reads from / writes to Azure Data Lake Storage Gen2
    - Runs on Azure Virtual Machines with Python geospatial stack
"""

import os
import logging
import argparse
import numpy as np

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# SCL (Scene Classification Layer) values to mask
# 0=No data, 1=Saturated, 2=Dark area, 3=Cloud shadow, 8=Cloud medium, 9=Cloud high, 10=Thin cirrus
CLOUD_MASK_VALUES = [0, 1, 2, 3, 8, 9, 10]


def load_band(filepath: str) -> np.ndarray:
    """
    Load a single band from a GeoTIFF file.

    Production: Uses rasterio
    Demo: Generates synthetic data
    """
    logger.info(f"Loading band: {filepath}")

    # --- PRODUCTION CODE ---
    # import rasterio
    # with rasterio.open(filepath) as src:
    #     band = src.read(1).astype('float32')
    #     profile = src.profile
    # return band, profile

    # --- DEMO: Generate synthetic band data ---
    np.random.seed(hash(filepath) % 2**32)
    band = np.random.uniform(500, 8000, (1000, 1000)).astype('float32')
    return band


def compute_ndvi(nir: np.ndarray, red: np.ndarray, epsilon: float = 1e-6) -> np.ndarray:
    """
    Compute Normalized Difference Vegetation Index (NDVI).

    NDVI = (NIR - RED) / (NIR + RED)

    Values range from -1 to 1:
        -1 to 0: Water, bare soil, artificial surfaces
        0 to 0.2: Sparse vegetation
        0.2 to 0.5: Moderate vegetation
        0.5 to 1.0: Dense vegetation (forests)
    """
    ndvi = (nir - red) / (nir + red + epsilon)
    ndvi = np.clip(ndvi, -1.0, 1.0)
    return ndvi


def apply_cloud_mask(ndvi: np.ndarray, scl_path: str = None) -> np.ndarray:
    """
    Apply cloud mask using Sentinel-2 Scene Classification Layer (SCL).
    Pixels classified as cloud, cloud shadow, or saturated are set to NaN.
    """
    if scl_path and os.path.exists(scl_path):
        logger.info("Applying cloud mask from SCL band")

        # --- PRODUCTION CODE ---
        # import rasterio
        # with rasterio.open(scl_path) as src:
        #     scl = src.read(1)
        # mask = np.isin(scl, CLOUD_MASK_VALUES)
        # ndvi[mask] = np.nan

        # --- DEMO: Randomly mask ~5% of pixels ---
        mask = np.random.random(ndvi.shape) < 0.05
        ndvi[mask] = np.nan
    else:
        logger.warning("No SCL band found — skipping cloud masking")

    return ndvi


def save_ndvi(ndvi: np.ndarray, output_path: str, profile: dict = None):
    """
    Save computed NDVI as a GeoTIFF file.
    """
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    logger.info(f"Saving NDVI raster to: {output_path}")

    # --- PRODUCTION CODE ---
    # import rasterio
    # profile.update(dtype='float32', count=1, nodata=np.nan)
    # with rasterio.open(output_path, 'w', **profile) as dst:
    #     dst.write(ndvi, 1)

    # --- DEMO: Save as numpy file ---
    np.save(output_path.replace('.tif', '.npy'), ndvi)

    # Compute and log statistics
    valid = ndvi[~np.isnan(ndvi)]
    if len(valid) > 0:
        logger.info(f"  NDVI stats — Mean: {valid.mean():.4f}, Min: {valid.min():.4f}, "
                     f"Max: {valid.max():.4f}, Std: {valid.std():.4f}")
        logger.info(f"  Valid pixels: {len(valid):,} / {ndvi.size:,} "
                     f"({100*len(valid)/ndvi.size:.1f}%)")


def compute_additional_indices(nir: np.ndarray, red: np.ndarray, green: np.ndarray = None,
                                swir: np.ndarray = None) -> dict:
    """
    Compute additional vegetation and environmental indices.
    """
    indices = {}

    # EVI - Enhanced Vegetation Index (better for high biomass areas)
    if green is not None:
        evi = 2.5 * (nir - red) / (nir + 6 * red - 7.5 * green + 1e-6)
        evi = np.clip(evi, -1.0, 1.0)
        indices['evi'] = evi
        logger.info(f"  EVI computed — Mean: {np.nanmean(evi):.4f}")

    # NDWI - Normalized Difference Water Index
    if swir is not None:
        ndwi = (nir - swir) / (nir + swir + 1e-6)
        ndwi = np.clip(ndwi, -1.0, 1.0)
        indices['ndwi'] = ndwi
        logger.info(f"  NDWI computed — Mean: {np.nanmean(ndwi):.4f}")

    return indices


def main():
    parser = argparse.ArgumentParser(description="Compute NDVI from Sentinel-2 bands")
    parser.add_argument("--input-dir", required=True, help="Directory containing band TIFFs")
    parser.add_argument("--output-dir", required=True, help="Output directory for NDVI rasters")
    parser.add_argument("--compute-evi", action="store_true", help="Also compute EVI")
    parser.add_argument("--compute-ndwi", action="store_true", help="Also compute NDWI")
    args = parser.parse_args()

    logger.info("=== NDVI Computation Pipeline ===")

    # 1. Load NIR and Red bands
    nir = load_band(os.path.join(args.input_dir, "B08.tif"))
    red = load_band(os.path.join(args.input_dir, "B04.tif"))

    # 2. Compute NDVI
    logger.info("Computing NDVI...")
    ndvi = compute_ndvi(nir, red)

    # 3. Apply cloud mask
    scl_path = os.path.join(args.input_dir, "SCL.tif")
    ndvi = apply_cloud_mask(ndvi, scl_path)

    # 4. Save NDVI raster
    product_name = os.path.basename(args.input_dir)
    output_path = os.path.join(args.output_dir, product_name, "ndvi.tif")
    save_ndvi(ndvi, output_path)

    # 5. Compute additional indices if requested
    if args.compute_evi or args.compute_ndwi:
        green = load_band(os.path.join(args.input_dir, "B03.tif")) if args.compute_evi else None
        swir = load_band(os.path.join(args.input_dir, "B11.tif")) if args.compute_ndwi else None
        additional = compute_additional_indices(nir, red, green, swir)

        for name, data in additional.items():
            idx_path = os.path.join(args.output_dir, product_name, f"{name}.tif")
            save_ndvi(data, idx_path)

    logger.info("=== NDVI computation complete ===")


if __name__ == "__main__":
    main()
