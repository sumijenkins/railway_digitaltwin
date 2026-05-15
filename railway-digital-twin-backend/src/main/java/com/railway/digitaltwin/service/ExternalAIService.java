package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.SensorFeature;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
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
}