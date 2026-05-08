package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.SensorFeature;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIXaiExplanationService {

    private final ExternalAIService externalAIService;

    public String generateExplanation(SensorFeature feature) {

        Map<String, Object> response = externalAIService.explainPrediction(feature);

        if (response == null || !response.containsKey("explanation")) {
            return "No XAI explanation generated.";
        }

        Object explanation = response.get("explanation");

        return explanation != null
                ? explanation.toString()
                : "No XAI explanation generated.";
    }
}