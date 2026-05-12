# ai-service/train_model.py

import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

np.random.seed(42)

normal_data = np.column_stack([
    np.random.normal(10, 3, 1000),      # rms
    np.random.normal(18, 5, 1000),      # peakToPeak
    np.random.normal(700, 180, 1000),   # fftEnergy
    np.random.normal(0.01, 0.01, 1000), # slopeGradient
    np.random.normal(80, 8, 1000),      # snr
])

model = Pipeline([
    ("scaler", StandardScaler()),
    ("isolation_forest", IsolationForest(
        n_estimators=100,
        contamination=0.08,
        random_state=42
    ))
])

model.fit(normal_data)

joblib.dump(model, "anomaly_model.joblib")

print("Model saved as anomaly_model.joblib")