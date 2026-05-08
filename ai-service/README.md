# AI Service

This service provides anomaly detection, remaining useful life estimation, and explainable AI outputs for the Railway Digital Twin system.

## Endpoints

### Health Check
GET /health

### Anomaly Detection
POST /anomaly

### Remaining Useful Life Prediction
POST /rul

### Explainable AI
POST /xai

## Run

```bash
python app.py

## Example Request
curl -X POST http://localhost:5000/anomaly -H "Content-Type: application/json" -d "{\"rms\":35,\"peakToPeak\":45,\"fftEnergy\":1800,\"slopeGradient\":0.09,\"snr\":30}"