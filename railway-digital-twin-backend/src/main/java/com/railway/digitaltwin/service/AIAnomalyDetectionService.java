package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.AnomalyResult;
import com.railway.digitaltwin.entity.SensorFeature;
import com.railway.digitaltwin.repository.AnomalyResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AIAnomalyDetectionService {

    private final AnomalyResultRepository anomalyResultRepository;

    public AnomalyResult detectAnomaly(SensorFeature feature) {

        // 🔹 Basit AI benzeri skor (ilk versiyon)
        double score = calculateAnomalyScore(feature);

        boolean isAnomaly = score > 0.7;

        AnomalyResult result = AnomalyResult.builder()
                .segmentId(feature.getSegmentId())
                .sensorId(feature.getSensorId())
                .detectedAt(LocalDateTime.now())
                .anomalyScore(score)
                .isAnomaly(isAnomaly)
                .modelType("IsolationForest-Simulated")
                .build();

        return anomalyResultRepository.save(result);
    }

    private double calculateAnomalyScore(SensorFeature f) {

        double score = 0.0;

        if (f.getRms() > 3) score += 0.3;
        if (f.getPeakToPeak() > 2) score += 0.2;
        if (f.getFftEnergy() > 50) score += 0.2;
        if (Math.abs(f.getSlopeGradient()) > 0.1) score += 0.1;
        if (f.getSnr() < 10) score += 0.2;

        return Math.min(score, 1.0);
    }
}