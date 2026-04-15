# Backend

**Stack:** Node.js + Express (or Python + FastAPI)

## Planned Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/districts` | List all districts with current metrics |
| GET | `/api/aqi?city=&year=` | AQI time-series data |
| GET | `/api/climate?city=&year=` | Temperature/humidity data |
| GET | `/api/population` | Population statistics |
| GET | `/api/ml/predict` | ML model predictions |
| GET | `/api/insights` | Auto-generated insights |

## Setup (coming in Step 3)

```bash
npm install
npm run dev
```
