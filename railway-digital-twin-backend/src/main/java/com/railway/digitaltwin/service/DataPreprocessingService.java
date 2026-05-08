package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.SensorFeature;
import com.railway.digitaltwin.repository.SensorFeatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DataPreprocessingService {

    private final SensorFeatureRepository sensorFeatureRepository;

    public SensorFeature processAndSaveFeatures(
            String segmentId,
            Integer sensorId,
            LocalDateTime recordedAt,
            Double temperature,
            Double vibrationX,
            Double vibrationY,
            Double vibrationZ,
            Double tilt
    ) {
        SensorFeature feature = calculateTransientFeatures(segmentId, sensorId, recordedAt, temperature, vibrationX, vibrationY, vibrationZ, tilt);
        return sensorFeatureRepository.save(feature);
    }

    public SensorFeature calculateTransientFeatures(
            String segmentId,
            Integer sensorId,
            LocalDateTime recordedAt,
            Double temperature,
            Double vibrationX,
            Double vibrationY,
            Double vibrationZ,
            Double tilt
    ) {
        List<Double> values = Arrays.asList(
                safeValue(temperature),
                safeValue(vibrationX),
                safeValue(vibrationY),
                safeValue(vibrationZ),
                safeValue(tilt)
        );

        double filteredTemperature = applyLowPassFilter(safeValue(temperature));
        double filteredVibrationX = applyLowPassFilter(safeValue(vibrationX));
        double filteredVibrationY = applyLowPassFilter(safeValue(vibrationY));
        double filteredVibrationZ = applyLowPassFilter(safeValue(vibrationZ));
        double filteredTilt = applyLowPassFilter(safeValue(tilt));

        List<Double> filteredValues = Arrays.asList(
                filteredTemperature,
                filteredVibrationX,
                filteredVibrationY,
                filteredVibrationZ,
                filteredTilt
        );

        // Combined vibration for legacy overall RMS if needed, or we can use the max/average
        double combinedVibration = Math.sqrt(
                Math.pow(filteredVibrationX, 2) + 
                Math.pow(filteredVibrationY, 2) + 
                Math.pow(filteredVibrationZ, 2)
        );

        return SensorFeature.builder()
                .segmentId(segmentId)
                .sensorId(sensorId)
                .recordedAt(recordedAt)
                .rms(calculateRms(Arrays.asList(combinedVibration))) // Overall vibration RMS
                .rmsX(calculateRms(Arrays.asList(filteredVibrationX)))
                .rmsY(calculateRms(Arrays.asList(filteredVibrationY)))
                .rmsZ(calculateRms(Arrays.asList(filteredVibrationZ)))
                .peakToPeak(calculatePeakToPeak(filteredValues))
                .fftEnergy(calculateFftEnergy(filteredValues))
                .slopeGradient(calculateSlopeGradient(filteredTilt))
                .meanValue(calculateMean(filteredValues))
                .standardDeviation(calculateStandardDeviation(filteredValues))
                .snr(calculateSnr(values, filteredValues))
                .dataLossRate(0.0)
                .build();
    }

    public double applyLowPassFilter(double value) {
        double alpha = 0.5;
        return alpha * value + (1 - alpha) * value;
    }

    public double applyKalmanFilter(double value) {
        return value;
    }

    public double calculateRms(List<Double> values) {
        double sumSquares = 0.0;

        for (Double value : values) {
            sumSquares += value * value;
        }

        return Math.sqrt(sumSquares / values.size());
    }

    public double calculatePeakToPeak(List<Double> values) {
        double min = values.stream().min(Double::compareTo).orElse(0.0);
        double max = values.stream().max(Double::compareTo).orElse(0.0);

        return max - min;
    }

    public double calculateFftEnergy(List<Double> values) {
        double energy = 0.0;

        for (Double value : values) {
            energy += value * value;
        }

        return energy;
    }

    public double calculateSlopeGradient(double tilt) {
        return Math.tan(Math.toRadians(tilt));
    }

    public double calculateMean(List<Double> values) {
        double sum = 0.0;

        for (Double value : values) {
            sum += value;
        }

        return sum / values.size();
    }

    public double calculateStandardDeviation(List<Double> values) {
        double mean = calculateMean(values);
        double sum = 0.0;

        for (Double value : values) {
            sum += Math.pow(value - mean, 2);
        }

        return Math.sqrt(sum / values.size());
    }

    public double calculateSnr(List<Double> rawValues, List<Double> filteredValues) {
        double signalPower = calculateFftEnergy(filteredValues);
        double noisePower = 0.0;

        for (int i = 0; i < rawValues.size(); i++) {
            noisePower += Math.pow(rawValues.get(i) - filteredValues.get(i), 2);
        }

        if (noisePower == 0) {
            return 100.0;
        }

        return 10 * Math.log10(signalPower / noisePower);
    }

    private double safeValue(Double value) {
        return value != null ? value : 0.0;
    }
}