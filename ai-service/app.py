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

        raw_scores = {
            "RMS": min(abs(rms) / 40, 1),
            "Peak-to-Peak": min(abs(peak_to_peak) / 50, 1),
            "FFT Energy": min(abs(fft_energy) / 2500, 1),
            "Slope Gradient": min(abs(slope_gradient) / 0.10, 1),
            "SNR": 1 - min(snr / 100, 1)
        }

        total_score = sum(raw_scores.values()) or 1

        feature_importance = [
            {
                "feature": feature,
                "importance": round(score / total_score, 4)
            }
            for feature, score in raw_scores.items()
        ]

        feature_importance.sort(
            key=lambda item: item["importance"],
            reverse=True
        )

        top_factors = []

        if rms > 25:
            top_factors.append({
                "feature": "RMS",
                "reason": "Yüksek RMS değeri anormal titreşim yoğunluğunu göstermektedir.",
                "severity": "HIGH"
            })

        if peak_to_peak > 30:
            top_factors.append({
                "feature": "Peak-to-Peak",
                "reason": "Yüksek Peak-to-Peak değeri ani sinyal değişimlerini göstermektedir.",
                "severity": "MEDIUM"
            })

        if fft_energy > 1200:
            top_factors.append({
                "feature": "FFT Energy",
                    "reason": "Yüksek FFT enerjisi, güçlü frekans alanında titreşimi göstermektedir.",
                "severity": "HIGH"
            })

        if abs(slope_gradient) > 0.03:
            top_factors.append({
                "feature": "Slope Gradient",
                "reason": "Yüksek eğim gradyanı, anormal ray yamağını gösterebilir.",
                "severity": "MEDIUM"
            })

        if snr < 60:
            top_factors.append({
                "feature": "SNR",
                "reason": "Düşük SNR, zayıf sinyal kalitesini göstermektedir.",
                "severity": "MEDIUM"
            })

        if not top_factors:
            top_factors.append({
                "feature": "All features",
                "reason": "Tüm sensör özellikleri normal çalışma aralığındadır.",
                "severity": "LOW"
            })

        key_factors = [
            factor["reason"] for factor in top_factors
        ]

        recommended_actions = []

        if any(factor["severity"] == "HIGH" for factor in top_factors):
            recommended_actions.extend([
                "İlgili demiryolu segmentini inceleyin.",
                "Segment doğrulanana kadar operasyon hızını azaltın.",
                "Önleyici bakım programlayın."
            ])
        elif any(factor["severity"] == "MEDIUM" for factor in top_factors):
            recommended_actions.extend([
                "Gerçek zamanlı izlemeye devam edin.",
                "Segmenti bir sonraki bakım döngüsünde kontrol edin."
            ])
        else:
            recommended_actions.append(
                "Şu anda acil bakım gerekmemektedir."
            )

        top_feature = feature_importance[0]["feature"]

        explanation = (
            f"Karar en çok {top_feature} özelliğinden etkilenmiştir."
            f" En önemli faktörler: "
            + ", ".join(factor["feature"] for factor in top_factors)
            + "."
        )

        return jsonify({
            "method": "RuleBasedXAI",
            "explanation": explanation,
            "featureImportance": feature_importance,
            "topFactors": top_factors,
            "keyFactors": key_factors,
            "recommendedActions": recommended_actions
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)