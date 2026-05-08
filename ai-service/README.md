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