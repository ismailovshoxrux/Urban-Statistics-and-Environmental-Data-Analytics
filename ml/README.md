# Machine Learning Module

**Stack:** Python + scikit-learn + pandas + numpy

## Planned Models

| Model | Target | Description |
|-------|--------|-------------|
| Linear Regression | AQI | Predict AQI from weather features |
| Time-Series (ARIMA) | Temperature | 12-month temperature forecast |
| Linear Regression | Population growth | Urban population trend |

## Folder Structure (coming in Step 4)

```
ml/
├── data/           # Raw and processed datasets
├── notebooks/      # Jupyter notebooks for EDA
├── models/         # Trained model files (.pkl)
├── scripts/
│   ├── train.py    # Model training
│   ├── predict.py  # Generate predictions
│   └── evaluate.py # Model evaluation metrics
└── requirements.txt
```

## Setup

```bash
pip install -r requirements.txt
python scripts/train.py
```
