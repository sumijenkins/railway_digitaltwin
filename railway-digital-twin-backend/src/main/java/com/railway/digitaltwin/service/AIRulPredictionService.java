package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.RulPredictionResponseDto;
import com.railway.digitaltwin.entity.AnomalyResult;
import com.railway.digitaltwin.entity.RulPredictionResult;
import com.railway.digitaltwin.entity.SensorFeature;
import com.railway.digitaltwin.repository.AnomalyResultRepository;
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
    private final AnomalyResultRepository anomalyResultRepository;

    public RulPredictionResponseDto predictRul(SensorFeature feature) {
        if (feature == null) {
            throw new IllegalArgumentException("Feature is null");
        }

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

        String degradationTrend = "STABİL";
        String trend = "STABLE";

        // Segmentin gerçek anomali geçmişini çek
        java.util.List<AnomalyResult> anomalyHistory =
                anomalyResultRepository.findBySegmentIdOrderByDetectedAtDesc(feature.getSegmentId());
        long activeAnomalyCount = anomalyHistory.stream()
                .filter(a -> Boolean.TRUE.equals(a.getIsAnomaly()))
                .count();
        double latestAnomalyScore = anomalyHistory.isEmpty() ? 0.0
                : (anomalyHistory.get(0).getAnomalyScore() != null ? anomalyHistory.get(0).getAnomalyScore() : 0.0);

        // AKADEMİK MANTIK: Bozulma trendi önce anomali durumuna göre belirlenir,
        // ardından geçmiş RUL kayıtlarıyla rafine edilir
        degradationTrend = determineDegradationTrend(latestAnomalyScore, activeAnomalyCount);
        trend = mapTrendCode(degradationTrend);

        // Geçmiş RUL kaydı varsa degradation skoru farkıyla rafine et (yalnızca WARNING/CRITICAL zonu için)
        java.util.List<RulPredictionResult> history = rulRepository.findBySegmentIdOrderByPredictedAtDesc(feature.getSegmentId());
        if (history != null && !history.isEmpty() && activeAnomalyCount > 0) {
            RulPredictionResult latestPast = history.get(0);
            if (latestPast.getDegradationScore() != null) {
                double diff = degradationScore - latestPast.getDegradationScore();
                if (diff > 0.01) {
                    degradationTrend = "HIZLI YIPRANMA (KÖTÜLEŞİYOR)";
                    trend = "RAPID_DETERIORATION";
                } else if (diff > 0.0001) {
                    degradationTrend = "KÖTÜLEŞİYOR";
                    trend = "DETERIORATING";
                } else if (diff < -0.01) {
                    degradationTrend = "ANLAMLI İYİLEŞME (BAKIM YAPILDI)";
                    trend = "SIGNIFICANT_IMPROVEMENT";
                } else if (diff < -0.0001) {
                    degradationTrend = "İYİLEŞİYOR";
                    trend = "IMPROVING";
                }
            }
        }

        if (response.get("degradationTrend") != null) {
            degradationTrend = response.get("degradationTrend").toString();
        }
        if (response.get("trend") != null) {
            trend = response.get("trend").toString();
        }

        String maintenancePriority = response.get("maintenancePriority") != null
                ? response.get("maintenancePriority").toString()
                : generatePriority(condition);
        // DINAMIK ENJEKSIYON: Sadece en son anomali tahmini AKTIF ise RUL ve önceliği güncelle
        boolean hasActiveAnomaly = false;
        double latestAnomalyScoreVar = 0.0;
        if (anomalyHistory != null && !anomalyHistory.isEmpty()) {
            AnomalyResult latest = anomalyHistory.get(0);
            if (Boolean.TRUE.equals(latest.getIsAnomaly())) {
                hasActiveAnomaly = true;
                latestAnomalyScoreVar = latest.getAnomalyScore() != null ? latest.getAnomalyScore() : 0.0;
            }
        }

        if (hasActiveAnomaly) {
            if (latestAnomalyScoreVar > 0.70) {
                condition = "CRITICAL";
                maintenancePriority = "YÜKSEK";
                remainingLifeDays = Math.min(remainingLifeDays, 25.0);
                degradationScore = Math.max(degradationScore, 0.85);
                confidenceLowerBound = remainingLifeDays * 0.9;
                confidenceUpperBound = remainingLifeDays * 1.1;
            } else {
                condition = "WARNING";
                maintenancePriority = "ORTA";
                remainingLifeDays = Math.min(remainingLifeDays, 75.0);
                degradationScore = Math.max(degradationScore, 0.55);
                confidenceLowerBound = remainingLifeDays * 0.9;
                confidenceUpperBound = remainingLifeDays * 1.1;
            }
        }
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

    /**
     * AKADEMİK MANTIK KORELASYoNU:
     * Bozulma trendi, segmentin gerçek anomali sayısı ve anomali skoruna bağlıdır.
     * Sıfır anomali + düşük skor → temiz hat asla aniden hızlı yıpranamaz.
     */
    public String determineDegradationTrend(double anomalyScore, long anomalyCount) {
        if (anomalyCount == 0 && anomalyScore < 0.30) {
            return "STABİL"; // Temiz hat asla aniden hızlı yıpranamaz
        } else if (anomalyCount > 3 || anomalyScore > 0.70) {
            return "HIZLI YIPRANMA (KÖTÜLEŞİYOR)";
        } else if (anomalyCount > 0 || anomalyScore > 0.30) {
            return "YAVAŞ AKIŞ / NORMAL";
        } else {
            return "STABİL";
        }
    }

    private String mapTrendCode(String degradationTrend) {
        if (degradationTrend == null) return "STABLE";
        return switch (degradationTrend) {
            case "HIZLI YIPRANMA (KÖTÜLEŞİYOR)" -> "RAPID_DETERIORATION";
            case "KÖTÜLEŞİYOR"                  -> "DETERIORATING";
            case "ANLAMLI İYİLEŞME (BAKIM YAPILDI)" -> "SIGNIFICANT_IMPROVEMENT";
            case "İYİLEŞİYOR"                   -> "IMPROVING";
            case "YAVAŞ AKIŞ / NORMAL"           -> "SLOW_FLOW";
            default                              -> "STABLE";
        };
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
        if (value == null)
            return 0.0;
        return Double.parseDouble(value.toString());
    }
}