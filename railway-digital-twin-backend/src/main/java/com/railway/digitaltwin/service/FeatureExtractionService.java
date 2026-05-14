package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.SensorFeature;
import com.railway.digitaltwin.entity.SensorReading;
import com.railway.digitaltwin.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.DoubleSummaryStatistics;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeatureExtractionService {

    private final SensorReadingRepository sensorReadingRepository;

    public SensorFeature extractLatestFeatures(String segmentId, Integer sensorId) {
        List<SensorReading> readings =
                sensorReadingRepository.findLatestReadingsBySegment(segmentId, 120);

        if (readings.isEmpty()) {
            return null;
        }

        List<Double> values = readings.stream()
                .map(SensorReading::getValue)
                .filter(v -> v != null)
                .toList();

        if (values.isEmpty()) {
            return null;
        }

        DoubleSummaryStatistics stats = values.stream()
                .mapToDouble(Double::doubleValue)
                .summaryStatistics();

        double mean = stats.getAverage();
        double min = stats.getMin();
        double max = stats.getMax();
        double peakToPeak = max - min;

        double rms = Math.sqrt(
                values.stream()
                        .mapToDouble(v -> v * v)
                        .average()
                        .orElse(0.0)
        );

        return SensorFeature.builder()
                .segmentId(segmentId)
                .sensorId(sensorId)
                .recordedAt(LocalDateTime.now())
                .rms(rms)
                .peakToPeak(peakToPeak)
                .meanValue(mean)
                .standardDeviation(calculateStd(values, mean))
                .build();
    }

    private double calculateStd(List<Double> values, double mean) {
    double variance = values.stream()
            .mapToDouble(v -> Math.pow(v - mean, 2))
            .average()
            .orElse(0.0);

    return Math.sqrt(variance);
}
}