# Data

This folder contains raw and processed datasets used by the application.

## Sources

| Dataset | Source | Format | Coverage |
|---------|--------|--------|----------|
| Air Quality (AQI, PM2.5, PM10) | Open AQ / Local EPA | CSV/JSON | Tashkent, 2019–2024 |
| Weather & Climate | Open-Meteo / NOAA | CSV/JSON | Tashkent, 2019–2024 |
| Population | UzStat / World Bank | CSV | Tashkent districts |
| Urban development | OpenStreetMap | GeoJSON | Tashkent city |

## Files (to be added)

```
data/
├── raw/                  # Unprocessed source files
│   ├── aqi_tashkent.csv
│   ├── weather_tashkent.csv
│   └── population.csv
├── processed/            # Cleaned and merged datasets
│   └── urban_merged.csv
└── mock/                 # Mock data used during development
    └── environmentData.json
```
