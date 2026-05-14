package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.AnomalyResult;
import com.railway.digitaltwin.entity.SensorFeature;
import com.railway.digitaltwin.repository.AnomalyResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIAnomalyDetectionService {

    private final AnomalyResultRepository anomalyResultRepository;
    private final ExternalAIService externalAIService;
    private final AIXaiExplanationService aiXaiExplanationService;

    public AnomalyResult detectAnomaly(SensorFeature feature) {

        Map<String, Object> response = externalAIService.detectAnomaly(feature);

        double score = (Double) response.get("anomalyScore");
        boolean isAnomaly = (Boolean) response.get("isAnomaly");

        Map<String, Object> xaiResponse = aiXaiExplanationService.generateExplanation(feature);

        String explanation = xaiResponse.get("explanation") != null
                ? xaiResponse.get("explanation").toString()
                : "No XAI explanation generated.";

        AnomalyResult result = AnomalyResult.builder()
                .segmentId(feature.getSegmentId())
                .sensorId(feature.getSensorId())
                .detectedAt(LocalDateTime.now())
                .anomalyScore(score)
                .isAnomaly(isAnomaly)
                .modelType("IsolationForest")
                .xaiExplanation(explanation)
                .build();
                
        return anomalyResultRepository.save(result);
    }
}