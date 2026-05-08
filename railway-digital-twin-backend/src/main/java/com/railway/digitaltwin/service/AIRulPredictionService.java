package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.SensorFeature;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIRulPredictionService {

    private final ExternalAIService externalAIService;

    public double estimateRemainingLife(SensorFeature feature) {

        Map<String, Object> response = externalAIService.predictRul(feature);

        if (response == null || !response.containsKey("remainingLifeDays")) {
            return 0.0;
        }

        Object value = response.get("remainingLifeDays");

        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }

        return Double.parseDouble(value.toString());
    }
}