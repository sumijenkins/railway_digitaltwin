import numpy as np
import joblib
from sklearn.ensemble import IsolationForest

normal_data = []

for _ in range(1000):
    rms = np.random.uniform(5, 25)
    peak_to_peak = np.random.uniform(5, 30)
    fft_energy = np.random.uniform(100, 1200)
    slope_gradient = np.random.uniform(-0.03, 0.03)
    snr = np.random.uniform(60, 100)

    normal_data.append([
        rms,
        peak_to_peak,
        fft_energy,
        slope_gradient,
        snr
    ])

model = IsolationForest(
    contamination=0.1,
    random_state=42
)

model.fit(np.array(normal_data))

joblib.dump(model, "models/isolation_forest.pkl")

print("Model trained and saved.")