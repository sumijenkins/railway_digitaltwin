package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.GeneratedReportDto;
import com.railway.digitaltwin.entity.AnomalyResult;
import com.railway.digitaltwin.repository.AnomalyResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReportGenerationService {

        private final ExternalAIService externalAIService;
        private final AnomalyResultRepository anomalyResultRepository;

        public GeneratedReportDto generateReport(String type) {
                AnomalyResult latestAnomaly = anomalyResultRepository.findTop50ByOrderByDetectedAtDesc().stream()
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Rapor üretilecek herhangi bir anomali kaydı bulunamadı."));

                String content = generateReportForAnomaly(latestAnomaly.getAnomalyId(), type);

                return GeneratedReportDto.builder()
                                .reportType(type)
                                .generatedAt(LocalDateTime.now().toString())
                                .content(content)
                                .build();
        }

        public String generateReportForAnomaly(Long anomalyId, String type) {
                AnomalyResult anomaly = anomalyResultRepository.findById(anomalyId)
                                .orElseThrow(() -> new RuntimeException(
                                                 "Talep edilen siber-fiziksel anomali kaydı bulunamadı: " + anomalyId));

                String condition = Boolean.TRUE.equals(anomaly.getIsAnomaly()) ? "CRITICAL / ANOMALOUS"
                                : "STABLE / NORMAL";

                // Raporlama döngüsü için varsayılan baskın sinyal etkeni belirlenir
                String dominantFactor = "Vibration / RMS Spectrum Shift";
                if (anomaly.getXaiExplanation() != null && anomaly.getXaiExplanation().contains("Slope Gradient")) {
                        dominantFactor = "Slope Gradient / Tilt Instability";
                }

                Map<String, Object> response = externalAIService.generateGenerativeReport(
                                anomaly.getSegmentId(),
                                anomaly.getAnomalyScore(),
                                condition,
                                dominantFactor,
                                type);

                return response.get("report") != null ? response.get("report").toString()
                                : "Doğal dil karar destek raporu üretilemedi.";
        }
}