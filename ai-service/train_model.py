# ai-service/train_model.py

import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
import os

np.random.seed(42)

# Realistic normal distribution values based on DataPreprocessingService.java
n_samples = 2000

# 1. rms (mean ~ 1.75, std ~ 0.45)
rms = np.random.normal(1.75, 0.45, n_samples)
rms = np.maximum(0.1, rms) # Ensure rms is positive

# 2. peakToPeak (mean ~ 30.0, std ~ 4.0)
peak_to_peak = np.random.normal(30.0, 4.0, n_samples)

# 3. fftEnergy (mean ~ 900.0, std ~ 180.0)
fft_energy = np.random.normal(900.0, 180.0, n_samples)

# 4. slopeGradient (mean ~ 0.0, std ~ 0.01)
slope_gradient = np.random.normal(0.0, 0.01, n_samples)

# 5. snr (mean ~ 82.0, std ~ 5.0)
snr = np.random.normal(82.0, 5.0, n_samples)

normal_data = np.column_stack([
    rms,
    peak_to_peak,
    fft_energy,
    slope_gradient,
    snr
])

model = IsolationForest(
    n_estimators=100,
    contamination=0.05,
    random_state=42
)

model.fit(normal_data)

os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/isolation_forest.pkl")
joblib.dump(model, "anomaly_model.joblib")

print("Model retrained successfully as raw IsolationForest and saved to models/isolation_forest.pkl!")