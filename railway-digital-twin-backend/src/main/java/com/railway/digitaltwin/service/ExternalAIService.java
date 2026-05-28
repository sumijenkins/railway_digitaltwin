package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.SensorFeature;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExternalAIService {

    private final RestTemplate restTemplate;

    @Value("${AI_SERVICE_URL:http://ai-service:5000}")
    private String aiUrl;

    public ExternalAIService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    // -------------------------
    // SCENARIO ANALYZE
    // -------------------------
    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeScenario(Map<String, Object> request) {
        return restTemplate.postForObject(
                aiUrl + "/scenario-analyze",
                request,
                Map.class);
    }

    // -------------------------
    // ANOMALY
    // -------------------------
    public Map<String, Object> detectAnomaly(SensorFeature feature) {
        return post("/anomaly", feature);
    }

    // -------------------------
    // RUL
    // -------------------------
    public Map<String, Object> predictRul(SensorFeature feature) {
        return post("/rul", feature);
    }

    // -------------------------
    // XAI
    // -------------------------
    public Map<String, Object> explainPrediction(SensorFeature feature) {
        return post("/xai", feature);
    }

    // -------------------------
    // COMMON MAPPER
    // -------------------------
    @SuppressWarnings("unchecked")
    private Map<String, Object> post(String path, SensorFeature feature) {

        Map<String, Object> req = new HashMap<>();
        req.put("rms", feature.getRms());
        req.put("peakToPeak", feature.getPeakToPeak());
        req.put("fftEnergy", feature.getFftEnergy());
        req.put("slopeGradient", feature.getSlopeGradient());
        req.put("snr", feature.getSnr());

        return restTemplate.postForObject(
                aiUrl + path,
                req,
                Map.class);
    }

    // -------------------------
    // GENERATIVE AI REPORT
    // -------------------------
    public Map<String, Object> generateGenerativeReport(String segmentId, double anomalyScore, String condition,
            String topFeature, String type) {
        Map<String, Object> req = new HashMap<>();
        req.put("segmentId", segmentId);
        req.put("anomalyScore", anomalyScore);
        req.put("condition", condition);
        req.put("topFeature", topFeature);
        req.put("type", type);

        @SuppressWarnings("unchecked")
        Map<String, Object> result = restTemplate.postForObject(
                aiUrl + "/generate-report",
                req,
                Map.class);
        return result;
    }

    // -------------------------
    // ANOMALY SEQUENCE (LSTM Autoencoder - Zaman Serisi Analizi)
    // -------------------------

    @SuppressWarnings("unchecked")
    public Map<String, Object> analyzeSequence(List<Map<String, Object>> sequenceData) {
        Map<String, Object> req = new HashMap<>();
        req.put("sequence", sequenceData);

        return restTemplate.postForObject(aiUrl + "/anomaly-sequence", req, Map.class);
    }
}