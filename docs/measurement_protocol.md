# Measurement, Reporting, and Verification (MRV) Protocol
## Carbon Credit Monitoring System

### 1. Overview

This document describes the methodology for measuring, reporting, and verifying carbon sequestration in forest ecosystems using satellite-based remote sensing. The protocol follows guidelines from:

- **IPCC Guidelines** for National Greenhouse Gas Inventories (2006, refined 2019)
- **VCS (Verified Carbon Standard)** VM0015 — Methodology for Avoided Unplanned Deforestation
- **Gold Standard** — AR (Afforestation/Reforestation) methodology
- **Winrock International** — Measurement Guidelines for Forest Carbon Sequestration

---

### 2. Biomass Estimation Methodology

#### 2.1 Satellite Data Acquisition
- **Sensor**: Sentinel-2 MSI (10-20m resolution)
- **Bands Used**: B04 (Red, 665nm), B08 (NIR, 842nm), B03 (Green, 560nm), B11 (SWIR, 1610nm)
- **Temporal Resolution**: 5-day revisit time
- **Cloud Masking**: Scene Classification Layer (SCL) — exclude classes 0, 1, 2, 3, 8, 9, 10

#### 2.2 Vegetation Indices
- **NDVI** = (NIR − Red) / (NIR + Red)
  - Range: -1 to +1
  - Dense forest: > 0.5
  - Moderate vegetation: 0.2-0.5
  - Bare/water: < 0.2
- **EVI** = 2.5 × (NIR − Red) / (NIR + 6×Red − 7.5×Blue + 1)
- **NDWI** = (NIR − SWIR) / (NIR + SWIR)

#### 2.3 Aboveground Biomass (AGB) Estimation
AGB is estimated using machine learning regression models trained on:
- **Features**: NDVI statistics (mean, median, std, percentiles), EVI, forest cover fraction, terrain variables
- **Labels**: Field plot biomass measurements or LiDAR-derived AGB maps
- **Model**: RandomForest / XGBoost regressor with spatial cross-validation

---

### 3. Carbon Conversion Factors

| Step | Factor | Source |
|------|--------|--------|
| AGB → Carbon | × 0.47 | IPCC Tier 1 default |
| Carbon → CO₂ equivalent | × 3.667 (44/12) | Molecular weight ratio |
| CO₂e → Carbon Credits | 1 credit = 1 tCO₂e | VCS/Gold Standard |

#### 3.1 Calculation Pipeline

```
AGB (tonnes/ha) → Carbon = AGB × 0.47
                → CO₂e = Carbon × (44/12) = Carbon × 3.667
                → Credits = CO₂e (1 credit per tCO₂e)
```

#### 3.2 Example Calculation

For a forest parcel of **1,000 hectares** with mean biomass of **200 tonnes/ha**:

| Metric | Value |
|--------|-------|
| Total AGB | 200,000 tonnes |
| Carbon content | 94,000 tonnes C |
| CO₂ equivalent | 344,698 tCO₂e |
| Carbon credits | 344,698 credits |

---

### 4. Forest Type Adjustment Factors

| Forest Type | Below-Ground Factor | Total Factor |
|-------------|---------------------|-------------|
| Tropical Evergreen | 1.30 | High biomass density |
| Tropical Moist | 1.15 | Moderate-high density |
| Mangrove | 0.95 | Unique carbon storage |
| Deciduous | 0.85 | Seasonal variation |
| Dry Deciduous | 0.70 | Lower density |
| Alpine | 0.50 | Low biomass |

---

### 5. Uncertainty & Quality Control

#### 5.1 Uncertainty Sources
- **Satellite data**: Atmospheric effects, cloud contamination, sensor calibration
- **Model uncertainty**: Cross-validation RMSE, prediction intervals
- **Conversion factors**: Tier 1 defaults vs site-specific values
- **Temporal**: Phenological changes, seasonal NDVI variation

#### 5.2 Quality Assurance
- Spatial cross-validation (avoid spatial autocorrelation leakage)
- Independent field plot validation (minimum 30 plots per forest type)
- Multi-temporal consistency checks
- Conservative estimation approach (deduct uncertainty from estimates)

#### 5.3 Reporting Standards
- Report confidence intervals at 90% or 95% level
- Document all assumptions and data sources
- Annual re-calibration with updated field data
- Third-party verification per VCS/Gold Standard requirements

---

### 6. Carbon Credit Issuance Rules

1. **Additionality**: Demonstrate carbon sequestration is additional to business-as-usual
2. **Permanence**: 25-100 year commitment with buffer pool (15-40% deduction)
3. **Leakage**: Account for activity displacement (5-20% deduction)
4. **Conservative Estimation**: Use lower bound when uncertainty exceeds 15%
5. **Vintage Year**: Credits issued for the year of sequestration measurement

---

### 7. References

1. IPCC (2006). *2006 IPCC Guidelines for National Greenhouse Gas Inventories*
2. IPCC (2019). *2019 Refinement to the 2006 Guidelines*
3. VCS (2012). *VM0015 Methodology for Avoided Unplanned Deforestation*
4. Winrock International. *Measurement Guidelines for the Sequestration of Forest Carbon*
5. Chave et al. (2014). *Improved allometric models to estimate aboveground biomass of tropical trees*
