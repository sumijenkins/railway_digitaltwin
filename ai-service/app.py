from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)

model = joblib.load("models/isolation_forest.pkl")

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "AI service is running"})


@app.route("/anomaly", methods=["POST"])
def detect_anomaly():

    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"error": "Invalid or empty JSON body"}), 400

    required_fields = [
        "rms",
        "peakToPeak",
        "fftEnergy",
        "slopeGradient",
        "snr"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"Missing field: {field}"
            }), 400

    try:

        rms = float(data["rms"])
        peak_to_peak = float(data["peakToPeak"])
        fft_energy = float(data["fftEnergy"])
        slope_gradient = float(data["slopeGradient"])
        snr = float(data["snr"])

        features = np.array([[
            rms,
            peak_to_peak,
            fft_energy,
            slope_gradient,
            snr
        ]])

        prediction = model.predict(features)[0]
        decision_score = model.decision_function(features)[0]

        is_anomaly = prediction == -1

        anomaly_score = float(
            max(0, min(1, 1 - ((decision_score + 0.2) / 0.4)))
        )

        return jsonify({
            "anomalyScore": round(anomaly_score, 4),
            "isAnomaly": bool(is_anomaly),
            "model": "IsolationForest"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/rul", methods=["POST"])
def predict_rul():

    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"error": "Invalid or empty JSON body"}), 400

    required_fields = [
        "rms",
        "peakToPeak",
        "fftEnergy",
        "slopeGradient",
        "snr"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"Missing field: {field}"
            }), 400

    try:

        rms = float(data["rms"])
        peak_to_peak = float(data["peakToPeak"])
        fft_energy = float(data["fftEnergy"])
        slope_gradient = float(data["slopeGradient"])
        snr = float(data["snr"])

        degradation_score = (
            0.30 * min(rms / 40, 1) +
            0.20 * min(peak_to_peak / 50, 1) +
            0.25 * min(fft_energy / 2500, 1) +
            0.15 * min(abs(slope_gradient) / 0.10, 1) +
            0.10 * (1 - min(snr / 100, 1))
        )

        degradation_score = max(0, min(degradation_score, 1))

        remaining_life_days = 180 * (1 - degradation_score)

        if degradation_score >= 0.70:
            condition = "CRITICAL"
        elif degradation_score >= 0.40:
            condition = "WARNING"
        else:
            condition = "NORMAL"

        return jsonify({
            "remainingLifeDays": round(remaining_life_days, 2),
            "degradationScore": round(degradation_score, 4),
            "condition": condition,
            "model": "RuleBasedRUL"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/xai", methods=["POST"])
def explain_prediction():

    data = request.get_json(silent=True)

    if data is None:
        return jsonify({"error": "Invalid or empty JSON body"}), 400

    required_fields = [
        "rms",
        "peakToPeak",
        "fftEnergy",
        "slopeGradient",
        "snr"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({
                "error": f"Missing field: {field}"
            }), 400

    try:
        rms = float(data["rms"])
        peak_to_peak = float(data["peakToPeak"])
        fft_energy = float(data["fftEnergy"])
        slope_gradient = float(data["slopeGradient"])
        snr = float(data["snr"])

        top_factors = []

        if rms > 25:
            top_factors.append({
                "feature": "RMS",
                "reason": "High RMS value indicates abnormal vibration intensity.",
                "severity": "HIGH"
            })

        if peak_to_peak > 30:
            top_factors.append({
                "feature": "Peak-to-Peak",
                "reason": "High peak-to-peak value indicates sudden signal variation.",
                "severity": "MEDIUM"
            })

        if fft_energy > 1200:
            top_factors.append({
                "feature": "FFT Energy",
                "reason": "High FFT energy indicates strong frequency-domain vibration.",
                "severity": "HIGH"
            })

        if abs(slope_gradient) > 0.03:
            top_factors.append({
                "feature": "Slope Gradient",
                "reason": "High slope gradient may indicate abnormal rail tilt.",
                "severity": "MEDIUM"
            })

        if snr < 60:
            top_factors.append({
                "feature": "SNR",
                "reason": "Low SNR indicates poor signal quality.",
                "severity": "MEDIUM"
            })

        if not top_factors:
            top_factors.append({
                "feature": "All features",
                "reason": "All sensor features are within the normal operating range.",
                "severity": "LOW"
            })

        explanation = "The decision was mainly influenced by: " + ", ".join(
            factor["feature"] for factor in top_factors
        )

        return jsonify({
            "topFactors": top_factors,
            "explanation": explanation,
            "method": "RuleBasedXAI"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)