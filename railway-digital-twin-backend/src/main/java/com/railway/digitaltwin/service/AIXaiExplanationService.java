package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.SensorFeature;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIXaiExplanationService {

    private final ExternalAIService externalAIService;

    public Map<String, Object> generateExplanation(SensorFeature feature) {

        Map<String, Object> response = externalAIService.explainPrediction(feature);

        if (response == null) {
            return Map.of(
                    "method", "Unavailable",
                    "explanation", "No XAI explanation generated.",
                    "featureImportance", java.util.List.of(),
                    "keyFactors", java.util.List.of(),
                    "recommendedActions", java.util.List.of()
            );
        }

        return response;
    }
}