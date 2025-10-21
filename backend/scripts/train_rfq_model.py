"""
Simple trainer to create a toy RFQ model for local development.
Saves model to backend/app/models/rfq_model.pkl

Run:
  python backend/scripts/train_rfq_model.py
"""
import os
from pathlib import Path
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor

OUT_DIR = Path(__file__).resolve().parents[1] / 'app' / 'models'
OUT_DIR.mkdir(parents=True, exist_ok=True)
MODEL_PATH = OUT_DIR / 'rfq_model.pkl'

# Synthetic dataset
rng = np.random.RandomState(42)
X = rng.rand(1000, 4)
# Create a target correlated with the features
y = X.dot(np.array([0.4, 0.3, 0.2, 0.1])) + 0.05 * rng.randn(1000)

model = RandomForestRegressor(n_estimators=50, random_state=42)
model.fit(X, y)

joblib.dump(model, MODEL_PATH)
print(f"Saved sample model to {MODEL_PATH}")
