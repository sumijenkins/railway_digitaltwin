from flask import Flask, request, jsonify
import numpy as np
from sklearn.ensemble import IsolationForest

app = Flask(__name__)

# 🔹 Dummy model (simulated training)
model = IsolationForest(contamination=0.1)

# Initial fake training data
train_data = np.random.rand(100, 5)
model.fit(train_data)


@app.route("/anomaly", methods=["POST"])
def detect_anomaly():
    data = request.json

    feature_vector = np.array([[
        data["rms"],
        data["peakToPeak"],
        data["fftEnergy"],
        data["slopeGradient"],
        data["snr"]
    ]])

    score = model.decision_function(feature_vector)[0]
    prediction = model.predict(feature_vector)[0]

    anomaly_score = float(1 - score)
    is_anomaly = True if prediction == -1 else False

    return jsonify({
        "anomalyScore": anomaly_score,
        "isAnomaly": is_anomaly,
        "model": "IsolationForest"
    })


if __name__ == "__main__":
    app.run(port=5000)