package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.RulPredictionResponseDto;
import com.railway.digitaltwin.entity.RulPredictionResult;
import com.railway.digitaltwin.entity.SensorFeature;
import com.railway.digitaltwin.repository.RulPredictionResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AIRulPredictionService {

    private final ExternalAIService externalAIService;
    private final RulPredictionResultRepository rulRepository;

    public RulPredictionResponseDto predictRul(SensorFeature feature) {

        Map<String, Object> response = externalAIService.predictRul(feature);

        Double remainingLifeDays = toDouble(response.get("remainingLifeDays"));
        Double degradationScore = toDouble(response.get("degradationScore"));
        Double confidence = response.get("confidence") != null
                ? toDouble(response.get("confidence"))
                : 0.85;

        Double confidenceLowerBound = response.get("confidenceLowerBound") != null
        ? toDouble(response.get("confidenceLowerBound"))
        : remainingLifeDays * 0.9;

        Double confidenceUpperBound = response.get("confidenceUpperBound") != null
                ? toDouble(response.get("confidenceUpperBound"))
                : remainingLifeDays * 1.1;

        String condition = response.get("condition") != null
                ? response.get("condition").toString()
                : "UNKNOWN";

        String degradationTrend = response.get("degradationTrend") != null
                ? response.get("degradationTrend").toString()
                : "BİLİNMİYOR";

        String maintenancePriority = response.get("maintenancePriority") != null
                ? response.get("maintenancePriority").toString()
                : generatePriority(condition);

        String trend = response.get("trend") != null
                ? response.get("trend").toString()
                : "UNKNOWN";

        String model = response.get("model") != null
                ? response.get("model").toString()
                : "RuleBasedRUL";

        String recommendedAction = response.get("recommendedAction") != null
                ? response.get("recommendedAction").toString()
                : generateRecommendedAction(condition);

        RulPredictionResult result = RulPredictionResult.builder()
                .segmentId(feature.getSegmentId())
                .sensorId(feature.getSensorId())
                .featureId(feature.getFeatureId())
                .predictedAt(LocalDateTime.now())
                .remainingLifeDays(remainingLifeDays)
                .degradationScore(degradationScore)
                .confidence(confidence)
                .condition(condition)
                .trend(trend)
                .modelType(model)
                .confidenceLowerBound(confidenceLowerBound)
                .confidenceUpperBound(confidenceUpperBound)
                .degradationTrend(degradationTrend)
                .maintenancePriority(maintenancePriority)
                .recommendedAction(recommendedAction)
                .build();

        return toDto(rulRepository.save(result));
    }

    private String generatePriority(String condition) {
    if ("CRITICAL".equalsIgnoreCase(condition)) {
        return "YÜKSEK";
    }

    if ("WARNING".equalsIgnoreCase(condition)) {
        return "ORTA";
    }

    return "DÜŞÜK";
}

    private String generateRecommendedAction(String condition) {
        if ("CRITICAL".equalsIgnoreCase(condition)) {
            return "Acil bakım planlayın ve segmenti yük taşımacılığı için kullanmadan önce kontrol edin.";
        }

        if ("WARNING".equalsIgnoreCase(condition)) {
            return "Planlı bakım incelemesi oluşturun ve segmenti yakından izleyin.";
        }

        return "Düzenli izlemeye devam edin.";
    }

    private RulPredictionResponseDto toDto(RulPredictionResult result) {
        return RulPredictionResponseDto.builder()
                .rulId(result.getRulId())
                .segmentId(result.getSegmentId())
                .sensorId(result.getSensorId())
                .featureId(result.getFeatureId())
                .predictedAt(result.getPredictedAt())
                .remainingLifeDays(result.getRemainingLifeDays())
                .degradationScore(result.getDegradationScore())
                .confidence(result.getConfidence())
                .confidenceLowerBound(result.getConfidenceLowerBound())
                .confidenceUpperBound(result.getConfidenceUpperBound())
                .degradationTrend(result.getDegradationTrend())
                .maintenancePriority(result.getMaintenancePriority())
                .condition(result.getCondition())
                .trend(result.getTrend())
                .modelType(result.getModelType())
                .recommendedAction(result.getRecommendedAction())
                .build();
    }

    private Double toDouble(Object value) {
        if (value == null) return 0.0;
        return Double.parseDouble(value.toString());
    }
}