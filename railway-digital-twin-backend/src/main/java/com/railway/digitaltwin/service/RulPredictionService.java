package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.SensorFeature;
import org.springframework.stereotype.Service;

@Service
public class RulPredictionService {

    public double estimateRemainingLife(SensorFeature feature) {

        double degradation = calculateDegradation(feature);

        double baseLifeDays = 180.0;

        double remainingLife = baseLifeDays * (1.0 - degradation);

        return Math.round(Math.max(remainingLife, 0.0) * 100.0) / 100.0;
    }

    private double calculateDegradation(SensorFeature f) {

        double rmsFactor = normalize(f.getRms(), 0.0, 40.0);
        double peakToPeakFactor = normalize(f.getPeakToPeak(), 0.0, 50.0);
        double fftEnergyFactor = normalize(f.getFftEnergy(), 0.0, 2500.0);
        double slopeFactor = normalize(Math.abs(f.getSlopeGradient()), 0.0, 0.10);
        double snrFactor = 1.0 - normalize(f.getSnr(), 0.0, 100.0);

        double degradation =
                (0.30 * rmsFactor) +
                (0.20 * peakToPeakFactor) +
                (0.25 * fftEnergyFactor) +
                (0.15 * slopeFactor) +
                (0.10 * snrFactor);

        return Math.min(Math.max(degradation, 0.0), 1.0);
    }

    private double normalize(Double value, double min, double max) {
        if (value == null) {
            return 0.0;
        }

        if (max == min) {
            return 0.0;
        }

        double normalized = (value - min) / (max - min);

        return Math.min(Math.max(normalized, 0.0), 1.0);
    }
}