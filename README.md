# 🌍 Cloud-Enabled Satellite-Based Carbon Credit Monitoring System

A cloud-native platform that leverages satellite imagery and Microsoft Azure services to monitor forest carbon sequestration, estimate biomass, and generate carbon credits — all through an interactive real-time dashboard.

## Architecture Overview

```
Sentinel-2 Satellite Data
        │
        ▼
┌─────────────────────┐     ┌──────────────────────┐
│  Azure Data Lake    │────▶│  Azure Virtual       │
│  Storage Gen2       │     │  Machines            │
│  (Raw Imagery)      │     │  (NDVI Preprocessing)│
└─────────────────────┘     └──────────┬───────────┘
                                       │
                                       ▼
                            ┌──────────────────────┐
                            │  Azure Machine       │
                            │  Learning            │
                            │  (Biomass Model)     │
                            └──────────┬───────────┘
                                       │
                                       ▼
┌─────────────────────┐     ┌──────────────────────┐
│  Azure Synapse      │◀────│  Carbon Credit       │
│  Analytics          │     │  Calculation Engine   │
│  (Data Warehouse)   │     └──────────────────────┘
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐     ┌──────────────────────┐
│  Azure App Service  │────▶│  Web Dashboard       │
│  (FastAPI Backend)  │     │  (React Frontend)    │
└─────────────────────┘     └──────────────────────┘
           │
           ▼
┌─────────────────────┐
│  Azure Monitor      │
│  (Ops & Alerts)     │
└─────────────────────┘
```

## Azure Services Used

| Service | Purpose |
|---------|---------|
| **Azure Maps** | Geospatial visualization of forest regions |
| **Azure Data Lake Storage** | Store satellite imagery and processed data |
| **Azure Virtual Machines** | NDVI computation and feature extraction |
| **Azure Machine Learning** | Biomass estimation model training & deployment |
| **Azure Synapse Analytics** | Data warehouse for carbon estimation results |
| **Azure App Service** | Backend API and dashboard hosting |
| **Azure Monitor** | System health and performance monitoring |

## Project Structure

```
CloudCarbonSeq/
├── api/                    # FastAPI backend
│   ├── app.py              # Main application
│   ├── models.py           # Pydantic data models
│   ├── demo_data.py        # Demo data generation
│   ├── requirements.txt    # Python dependencies
│   └── routes/             # API route handlers
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # Dashboard, Satellite, Credits, Analytics, Azure
│   │   ├── components/     # Reusable UI components
│   │   └── utils/          # API client
│   └── package.json
├── data_ingest/            # Satellite data ingestion scripts
├── preprocessing/          # NDVI calculation and feature extraction
├── models/                 # ML model training scripts
├── infra/                  # Azure Bicep IaC templates
└── docs/                   # MRV documentation
```

## Quick Start

### Backend API
```bash
cd api
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

### Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to access the dashboard.

### Azure Deployment
```bash
az deployment group create \
  --resource-group carbon-monitor-rg \
  --template-file infra/azure-deploy.bicep \
  --parameters projectName=carbonseq
```

## Carbon Credit Methodology

- **Biomass to Carbon**: AGB × 0.47 = Carbon (tonnes)
- **Carbon to CO₂e**: Carbon × 3.667 (44/12) = CO₂ equivalent
- **Carbon Credits**: 1 credit = 1 tCO₂e sequestered
- **Standards**: VCS (Verified Carbon Standard), IPCC Guidelines

## Tech Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn
- **Frontend**: React 18, Vite, Recharts, Leaflet
- **Cloud**: Microsoft Azure (7 services)
- **ML**: scikit-learn, XGBoost, Azure ML SDK
- **Data**: rasterio, geopandas, numpy, pandas

## License

MIT License — see [LICENSE](LICENSE) for details.
