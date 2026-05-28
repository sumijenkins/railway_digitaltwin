package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.EnergyRiskResponseDto;
import com.railway.digitaltwin.dto.TelemetryView;
import com.railway.digitaltwin.entity.EnergyRisk;
import com.railway.digitaltwin.repository.EnergyRiskRepository;
import com.railway.digitaltwin.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class EnergyRiskService {

    private final EnergyRiskRepository energyRiskRepository;
    private final SensorReadingRepository sensorReadingRepository;
    private final com.railway.digitaltwin.dss.service.DecisionSupportService decisionSupportService;

    @Transactional(readOnly = true)
    public Page<EnergyRiskResponseDto> getAllEnergyRisks(Pageable pageable) {
        return energyRiskRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<EnergyRiskResponseDto> getRiskBySegment(String segmentId, Pageable pageable) {
        return energyRiskRepository.findBySegment_SegmentId(segmentId, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<EnergyRiskResponseDto> calculateCurrentEnergyRisk() {
        List<TelemetryView> readings = sensorReadingRepository
                .findLatestTelemetry(PageRequest.of(0, 500))
                .getContent();

        Map<String, Map<String, TelemetryView>> latestBySegment = new HashMap<>();

        for (TelemetryView reading : readings) {
            latestBySegment
                    .computeIfAbsent(reading.getSegmentId(), k -> new HashMap<>())
                    .put(reading.getChannelName(), reading);
        }

        List<EnergyRiskResponseDto> result = new ArrayList<>();

        for (Map.Entry<String, Map<String, TelemetryView>> entry : latestBySegment.entrySet()) {
            String segmentId = entry.getKey();
            Map<String, TelemetryView> channels = entry.getValue();

            Double temperature = getValue(channels, "temperature");
            Double vibration = getValue(channels, "vibrationX");
            Double tilt = getValue(channels, "rail_slope");

            String segmentName = getSegmentName(channels);

            // DSS Raporunu Çekerek Risk Skoru ve Seviyesini Birebir DSS İle Senkronize Et
            com.railway.digitaltwin.dss.dto.DecisionSupportResponseDto dssReport = 
                    decisionSupportService.generateSegmentReport(segmentId);

            double dssRisk = dssReport.getRiskScore() != null ? dssReport.getRiskScore() : 0.0;
            String dssLevel = dssReport.getSeverity() != null ? dssReport.getSeverity().toString() : "LOW";

            String riskLevel = "LOW";
            if ("WARNING".equalsIgnoreCase(dssLevel)) {
                riskLevel = "WARNING";
            } else if ("CRITICAL".equalsIgnoreCase(dssLevel)) {
                riskLevel = "CRITICAL";
            }

            double energyScore = calculateEnergyScore(temperature, vibration, tilt);
            String recommendation = generateRecommendation(riskLevel);

            result.add(EnergyRiskResponseDto.builder()
                    .segmentId(segmentId)
                    .segmentName(segmentName)
                    .temperature(temperature)
                    .vibration(vibration)
                    .tilt(tilt)
                    .energyScore(round(energyScore))
                    .riskScore(round(dssRisk))
                    .riskLevel(riskLevel)
                    .recommendation(recommendation)
                    .build());
        }

        result.sort(Comparator.comparing(EnergyRiskResponseDto::getSegmentId));
        return result;
    }

    private EnergyRiskResponseDto toDto(EnergyRisk e) {
        return EnergyRiskResponseDto.builder()
                .recordId(e.getRecordId())
                .energyConsumption(e.getEnergyConsumption())
                .riskScore(e.getRiskScore())
                .calculatedTime(e.getCalculatedTime())
                .segmentId(e.getSegment() != null ? e.getSegment().getSegmentId() : null)
                .segmentName(e.getSegment() != null ? e.getSegment().getName() : null)
                .segmentRiskLevel(e.getSegment() != null ? e.getSegment().getRiskLevel() : null)
                .build();
    }

    private Double getValue(Map<String, TelemetryView> channels, String channelName) {
        TelemetryView view = channels.get(channelName);
        return view != null ? view.getValue() : 0.0;
    }


    private String getSegmentName(Map<String, TelemetryView> channels) {
        return channels.values()
                .stream()
                .findFirst()
                .map(TelemetryView::getSegmentName)
                .orElse("Unknown Segment");
    }

    private double calculateEnergyScore(Double temperature, Double vibration, Double tilt) {
        double baseEnergy = 100.0;
        double temperaturePenalty = Math.max(0, temperature - 25) * 0.8;
        double vibrationPenalty = vibration * 8.0;
        double tiltPenalty = Math.abs(tilt) * 6.0;

        return baseEnergy + temperaturePenalty + vibrationPenalty + tiltPenalty;
    }

    private double calculateRiskScore(Double temperature, Double vibration, Double tilt) {
        double tempRisk = Math.min(40, Math.max(0, temperature - 30) * 2.5);
        double vibrationRisk = Math.min(40, vibration * 10);
        double tiltRisk = Math.min(20, Math.abs(tilt) * 5);

        return tempRisk + vibrationRisk + tiltRisk;
    }

    /**
     * Eşikleri 0.0–1.0 aralığında değerlendirir (DSS ile tam uyumlu).
     * 0.30 eşiği: DSS'nin WARNING başlangıç noktası ile birebir örtüşür.
     */
    private String determineRiskLevel(double normalizedRiskScore) {
        if (normalizedRiskScore > 0.60) {
            return "CRITICAL";
        } else if (normalizedRiskScore > 0.30) {
            return "WARNING"; // DSS ile tam uyumlu: 0.34 artık WARNING döndürür
        } else {
            return "LOW";
        }
    }

    private String generateRecommendation(String riskLevel) {
        if ("CRITICAL".equals(riskLevel)) {
            return "Bu segment için acil inceleme önerilir.";
        }

        if ("WARNING".equals(riskLevel)) {
            return "Bu segment yakından izlenmeli ve önleyici bakım için planlanmalıdır.";
        }

        return "Segment normal koşullar altında çalışmaktadır.";
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}