package com.railway.digitaltwin.dss.service;

import com.railway.digitaltwin.dto.TelemetryResponseDto;
import com.railway.digitaltwin.dss.dto.*;
import com.railway.digitaltwin.dss.model.DecisionSeverity;
import com.railway.digitaltwin.entity.Anomaly;
import com.railway.digitaltwin.repository.AnomalyRepository;
import com.railway.digitaltwin.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import com.railway.digitaltwin.entity.RulPredictionResult;
import com.railway.digitaltwin.repository.RulPredictionResultRepository;
import com.railway.digitaltwin.entity.AnomalyResult;
import com.railway.digitaltwin.repository.AnomalyResultRepository;
import java.util.Optional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DecisionSupportService {

    private final TelemetryService telemetryService;
    private final AnomalyRepository anomalyRepository;
    private final RulPredictionResultRepository rulPredictionResultRepository;
    private final AnomalyResultRepository anomalyResultRepository;

    public DecisionSupportResponseDto generateSegmentReport(String segmentId) {
        List<TelemetryResponseDto> telemetryList =
                telemetryService.getLatestBySegment(segmentId, PageRequest.of(0, 80)).getContent();

        if (telemetryList == null || telemetryList.isEmpty()) {
            return noDataReport(segmentId);
        }

        String segmentName = telemetryList.get(0).getSegmentName();
        String existingRiskLevel = telemetryList.get(0).getRiskLevel();

        double temperature = averageByChannel(telemetryList, "temperature");
        double vibration = averageByChannel(telemetryList, "vibration");
        double tilt = averageByChannel(telemetryList, "slope");
        double speed = averageByChannel(telemetryList, "speed");

        List<Anomaly> anomalies =
                anomalyRepository.findBySegment_SegmentIdOrderByDetectedTimeDesc(segmentId);
        
        Optional<RulPredictionResult> latestRul =
        rulPredictionResultRepository.findBySegmentIdOrderByPredictedAtDesc(segmentId)
                .stream()
                .findFirst();

        // ÇÖZÜM ENJEKSİYONU: En güncel anomali/alarm kayıtlarını kontrol et
        List<AnomalyResult> latestAnomalies = anomalyResultRepository.findBySegmentIdOrderByDetectedAtDesc(segmentId);
        
        boolean hasActiveTempAnomaly = false;
        boolean hasActiveVibAnomaly = false;
        
        if (latestAnomalies != null && !latestAnomalies.isEmpty()) {
            AnomalyResult lastAnomaly = latestAnomalies.get(0);
            if (lastAnomaly.getIsAnomaly() != null && lastAnomaly.getIsAnomaly()) {
                // xaiExplanation (description) VE channelName her ikisini de kontrol et
                String desc = lastAnomaly.getDescription() != null ? lastAnomaly.getDescription().toLowerCase() : "";
                String channel = lastAnomaly.getChannelName() != null ? lastAnomaly.getChannelName().toLowerCase() : "";

                boolean tempSignal = desc.contains("temp") || desc.contains("sıcaklık")
                        || channel.contains("temp") || channel.contains("sıcaklık");
                boolean vibSignal = desc.contains("vib") || desc.contains("titreşim")
                        || channel.contains("vib") || channel.contains("titreşim") || channel.contains("vibration");

                // Herhangi bir tür belirtilmemişse → genel anomali; her iki bayrağı da kaldır
                if (!tempSignal && !vibSignal) {
                    hasActiveTempAnomaly = true;
                    hasActiveVibAnomaly = true;
                } else {
                    if (tempSignal) hasActiveTempAnomaly = true;
                    if (vibSignal)  hasActiveVibAnomaly = true;
                }
            }
        }

        double riskScore = calculateRiskScore(
                temperature,
                vibration,
                tilt,
                speed,
                anomalies.size(),
                existingRiskLevel,
                latestRul
        );
        double energyImpact = calculateEnergyImpact(temperature, vibration, tilt, speed);
        DecisionSeverity severity = determineSeverity(riskScore, existingRiskLevel, anomalies, hasActiveTempAnomaly || hasActiveVibAnomaly);

        return DecisionSupportResponseDto.builder()
                .segmentId(segmentId)
                .severity(severity)
                .riskScore(round(riskScore))
                .estimatedEnergyImpact(round(energyImpact))
                .summary(generateSummary(segmentId, segmentName, severity))
                .executiveSummary(generateExecutiveSummary(segmentId, segmentName, severity, riskScore, energyImpact, anomalies.size(), latestRul))
                .technicalExplanation(generateTechnicalExplanation(temperature, vibration, tilt, speed, riskScore, energyImpact, anomalies.size()))
                .maintenanceRecommendation(generateMaintenanceRecommendation(severity))
                .routeRecommendation(generateRouteRecommendation(severity))
                .keyFindings(generateKeyFindings(segmentId, segmentName, temperature, vibration, tilt, speed, anomalies.size(), existingRiskLevel, riskScore, severity))
                .recommendedActions(generateActions(severity, temperature, vibration, tilt, speed, anomalies.size()))
                .technicalDetails(generateTechnicalDetails(temperature, vibration, tilt, speed, anomalies.size(), existingRiskLevel))
                .featureContributions(generateFeatureContributions(temperature, vibration, tilt, speed, anomalies.size(), existingRiskLevel, hasActiveTempAnomaly, hasActiveVibAnomaly))
                .generatedAt(LocalDateTime.now())
                .build();
    }

    public DecisionSupportOverviewDto generateOverviewReport() {
        List<String> segmentIds = List.of("S1", "S2", "S3", "S4", "S5", "S6");

        List<DecisionSupportResponseDto> reports = segmentIds.stream()
                .map(this::generateSegmentReport)
                .sorted((a, b) -> Double.compare(b.getRiskScore(), a.getRiskScore()))
                .toList();

        int criticalCount = (int) reports.stream()
                .filter(r -> r.getSeverity() == DecisionSeverity.CRITICAL)
                .count();

        int warningCount = (int) reports.stream()
                .filter(r -> r.getSeverity() == DecisionSeverity.WARNING)
                .count();

        int normalCount = (int) reports.stream()
                .filter(r -> r.getSeverity() == DecisionSeverity.NORMAL)
                .count();

        String overallStatus = criticalCount > 0 ? "CRITICAL" : warningCount > 0 ? "WARNING" : "NORMAL";

        List<ActionItemDto> maintenancePriorityList = reports.stream()
                .filter(r -> r.getSeverity() != DecisionSeverity.NORMAL)
                .map(r -> ActionItemDto.builder()
                        .priority(r.getSeverity())
                        .action("Segment " + r.getSegmentId() + " için bakım/inceleme planlanmalıdır.")
                        .reason(r.getExecutiveSummary())
                        .build())
                .toList();

        return DecisionSupportOverviewDto.builder()
                .overallStatus(overallStatus)
                .summary(generateOverviewSummary(overallStatus, criticalCount, warningCount, normalCount))
                .totalSegments(reports.size())
                .criticalCount(criticalCount)
                .warningCount(warningCount)
                .normalCount(normalCount)
                .segmentReports(reports)
                .maintenancePriorityList(maintenancePriorityList)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    public RouteDecisionReportDto generateRouteReport() {
        DecisionSupportOverviewDto overview = generateOverviewReport();

        List<DecisionSupportResponseDto> safeSegments = overview.getSegmentReports().stream()
                .filter(r -> r.getSeverity() == DecisionSeverity.NORMAL)
                .sorted((a, b) -> Double.compare(a.getEstimatedEnergyImpact() + a.getRiskScore(),
                        b.getEstimatedEnergyImpact() + b.getRiskScore()))
                .toList();

        List<DecisionSupportResponseDto> riskySegments = overview.getSegmentReports().stream()
                .filter(r -> r.getSeverity() != DecisionSeverity.NORMAL)
                .toList();

        List<String> selectedSegments = safeSegments.stream()
                .map(DecisionSupportResponseDto::getSegmentId)
                .toList();

        List<String> avoidedSegments = riskySegments.stream()
                .map(DecisionSupportResponseDto::getSegmentId)
                .toList();

        double totalRiskScore = safeSegments.stream()
                .mapToDouble(DecisionSupportResponseDto::getRiskScore)
                .sum();

        String selectedRoute = selectedSegments.isEmpty()
                ? "Uygun güvenli rota bulunamadı"
                : String.join(" → ", selectedSegments);

        String reason = "Rota seçimi; segmentlerin risk skoru, enerji etkisi, anomali geçmişi ve mevcut telemetri değerleri birlikte değerlendirilerek yapılmıştır. "
                + "Riskli segmentler rota dışında bırakılmıştır: "
                + (avoidedSegments.isEmpty() ? "Yok" : String.join(", ", avoidedSegments)) + ".";

        return RouteDecisionReportDto.builder()
                .selectedRoute(selectedRoute)
                .selectedSegments(selectedSegments)
                .avoidedSegments(avoidedSegments)
                .totalRiskScore(round(totalRiskScore))
                .summary("DSS, düşük riskli ve düşük enerji etkili segmentleri önceliklendirerek rota önerisi üretmiştir.")
                .reason(reason)
                .recommendedAction(riskySegments.isEmpty()
                        ? "Tüm segmentler kullanılabilir durumdadır. Düzenli izleme devam etmelidir."
                        : "Önerilen rota kullanılmalı, kaçınılan segmentler bakım öncesi yük taşımacılığına dahil edilmemelidir.")
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private double averageByChannel(List<TelemetryResponseDto> list, String keyword) {
        return list.stream()
                .filter(t -> t.getChannelName() != null)
                .filter(t -> t.getChannelName().toLowerCase().contains(keyword.toLowerCase()))
                .filter(t -> t.getValue() != null)
                .mapToDouble(TelemetryResponseDto::getValue)
                .average()
                .orElse(0.0);
    }

    private double calculateRiskScore(
        double temperature,
        double vibration,
        double tilt,
        double speed,
        int anomalyCount,
        String riskLevel,
        Optional<RulPredictionResult> latestRul
) {
    double tempRisk = Math.min(temperature / 80.0, 1.0);
    double vibrationRisk = Math.min(vibration / 5.0, 1.0);
    double tiltRisk = Math.min(Math.abs(tilt) / 5.0, 1.0);
    double speedRisk = Math.min(speed / 120.0, 1.0);
    double anomalyRisk = Math.min(anomalyCount / 10.0, 1.0);
    double baseRisk = mapRiskLevel(riskLevel);

    double rulRisk = latestRul
            .map(r -> {
                Double days = r.getRemainingLifeDays();
                if (days == null) return 0.0;
                return Math.max(0.0, Math.min(1.0, 1.0 - (days / 180.0)));
            })
            .orElse(0.0);

    return (0.20 * tempRisk)
            + (0.20 * vibrationRisk)
            + (0.10 * tiltRisk)
            + (0.10 * speedRisk)
            + (0.15 * anomalyRisk)
            + (0.10 * baseRisk)
            + (0.15 * rulRisk);
}

    private double calculateEnergyImpact(double temperature, double vibration, double tilt, double speed) {
        double tempFactor = Math.min(temperature / 80.0, 1.0);
        double vibrationFactor = Math.min(vibration / 5.0, 1.0);
        double tiltFactor = Math.min(Math.abs(tilt) / 5.0, 1.0);
        double speedFactor = Math.min(speed / 120.0, 1.0);

        return (0.35 * speedFactor)
                + (0.25 * tiltFactor)
                + (0.25 * vibrationFactor)
                + (0.15 * tempFactor);
    }

    private DecisionSeverity determineSeverity(double riskScore, String existingRiskLevel, List<Anomaly> anomalies, boolean hasActiveAnomaly) {
        // Veritabanı risk seviyesi yalnızca CRITICAL veya WARNING ise yükselt;
        // LOW → hesaplanan risk skoruna göre karar ver (sabit LOW ataması yapmıyoruz)
        if (existingRiskLevel != null) {
            String value = existingRiskLevel.toUpperCase();

            if (value.contains("CRITICAL") || value.contains("HIGH")) {
                return DecisionSeverity.CRITICAL;
            }

            if (value.contains("MEDIUM") || value.contains("WARNING")) {
                return DecisionSeverity.WARNING;
            }
        }

        boolean hasHighAnomaly = anomalies.stream()
                .anyMatch(a -> a.getSeverity() != null && a.getSeverity().equalsIgnoreCase("HIGH"));

        if (riskScore >= 0.70 || hasHighAnomaly) {
            return DecisionSeverity.CRITICAL;
        }

        // hasActiveAnomaly tek başına WARNING üretemez; en az bir anomali kaydı da olmak zorunda.
        // Bu, 0 anomalisi olan temiz segmentlerin (S1 gibi) haksız yere WARNING almasını önler.
        boolean anomalyBasedWarning = !anomalies.isEmpty() && hasActiveAnomaly;

        if (riskScore >= 0.40 || !anomalies.isEmpty() || anomalyBasedWarning) {
            return DecisionSeverity.WARNING;
        }

        return DecisionSeverity.NORMAL;
    }

    private List<FeatureContributionDto> generateFeatureContributions(double temperature, double vibration, double tilt, double speed, int anomalyCount, String riskLevel, boolean hasActiveTempAnomaly, boolean hasActiveVibAnomaly) {
        List<FeatureContributionDto> list = new ArrayList<>();

        // 1. Sıcaklık Katkısı Ayarı
        String tempLevel = "LOW";
        String tempDesc = "Sıcaklık normal aralıktadır.";
        if (hasActiveTempAnomaly || temperature > 40.0) {
            tempLevel = "HIGH";
            tempDesc = "KRİTİK SICAKLIK: Ray sıcaklığı güvenli limitlerin üzerinde!";
        }
        list.add(feature("Sıcaklık", tempLevel, tempDesc));

        // 2. Titreşim Katkısı Ayarı
        String vibLevel = "LOW";
        String vibDesc = "Titreşim seviyesi kararlıdır.";
        if (hasActiveVibAnomaly || vibration > 2.5) {
            vibLevel = "HIGH";
            vibDesc = "YÜKSEK TİTREŞİM: Spektral RMS değerlerinde sapma algılandı!";
        }
        list.add(feature("Titreşim", vibLevel, vibDesc));

        list.add(feature("Eğim", Math.abs(tilt) > 3 ? "MEDIUM" : "LOW",
                Math.abs(tilt) > 3 ? "Eğim değişimi enerji tüketimini ve güvenlik riskini artırabilir." : "Eğim değeri kabul edilebilir düzeydedir."));

        list.add(feature("Hız", speed > 85 ? "MEDIUM" : "LOW",
                speed > 85 ? "Yüksek hız risk ve enerji etkisini artırabilir." : "Hız değeri uygun aralıktadır."));

        list.add(feature("Anomali Geçmişi", anomalyCount > 0 ? "MEDIUM" : "LOW",
                anomalyCount > 0 ? "Bu segmentte geçmiş/aktif anomali kayıtları bulunmaktadır." : "Bu segment için belirgin anomali geçmişi yoktur."));

        return list;
    }

    private FeatureContributionDto feature(String name, String impact, String explanation) {
        return FeatureContributionDto.builder()
                .feature(name)
                .impact(impact)
                .explanation(explanation)
                .build();
    }

    private List<String> generateKeyFindings(String segmentId, String segmentName, double temperature, double vibration, double tilt, double speed, int anomalyCount, String riskLevel, double riskScore, DecisionSeverity severity) {
        List<String> findings = new ArrayList<>();

        findings.add("Segment: " + (segmentName != null ? segmentName : segmentId));
        findings.add("Ortalama sıcaklık: " + round(temperature));
        findings.add("Ortalama titreşim: " + round(vibration));
        findings.add("Ortalama eğim: " + round(tilt));
        findings.add("Ortalama hız: " + round(speed));
        findings.add("Anomali sayısı: " + anomalyCount);
        findings.add("Veritabanı risk seviyesi: " + riskLevel);
        findings.add("DSS risk skoru: " + round(riskScore));
        findings.add("Karar seviyesi: " + severity);

        return findings;
    }

    private List<ActionItemDto> generateActions(DecisionSeverity severity, double temperature, double vibration, double tilt, double speed, int anomalyCount) {
        List<ActionItemDto> actions = new ArrayList<>();

        if (severity == DecisionSeverity.CRITICAL) {
            actions.add(action(DecisionSeverity.CRITICAL, "Acil bakım incelemesi başlatın.", "DSS risk seviyesi kritik olarak hesaplandı."));
        } else if (severity == DecisionSeverity.WARNING) {
            actions.add(action(DecisionSeverity.WARNING, "Planlı kontrol oluşturun.", "Segment uyarı seviyesinde risk göstermektedir."));
        } else {
            actions.add(action(DecisionSeverity.NORMAL, "Düzenli izlemeye devam edin.", "Segment normal çalışma koşullarındadır."));
        }

        if (temperature > 45) {
            actions.add(action(DecisionSeverity.WARNING, "Sıcaklık kaynaklı stres kontrolü yapın.", "Sıcaklık normal sınırların üzerindedir."));
        }

        if (vibration > 2.5) {
            actions.add(action(DecisionSeverity.WARNING, "Titreşim kaynağını inceleyin.", "Yüksek titreşim yapısal risk göstergesi olabilir."));
        }

        if (Math.abs(tilt) > 3) {
            actions.add(action(DecisionSeverity.WARNING, "Ray eğimi kontrol edilmelidir.", "Eğim değişimi operasyonel risk oluşturabilir."));
        }

        if (speed > 85) {
            actions.add(action(DecisionSeverity.WARNING, "Hız azaltımı değerlendirilmelidir.", "Yüksek hız enerji ve güvenlik riskini artırabilir."));
        }

        if (anomalyCount > 0) {
            actions.add(action(DecisionSeverity.WARNING, "Anomali kayıtları incelenmelidir.", "Segmentte önceki veya aktif anomali kayıtları vardır."));
        }

        return actions;
    }

    private ActionItemDto action(DecisionSeverity priority, String action, String reason) {
        return ActionItemDto.builder()
                .priority(priority)
                .action(action)
                .reason(reason)
                .build();
    }

    private String generateSummary(String segmentId, String segmentName, DecisionSeverity severity) {
        String location = segmentName != null ? segmentName : segmentId;
        return "Segment " + location + " DSS tarafından " + severity + " seviyesinde değerlendirilmiştir.";
    }

    private String generateExecutiveSummary(
        String segmentId,
        String segmentName,
        DecisionSeverity severity,
        double riskScore,
        double energyImpact,
        int anomalyCount,
        Optional<RulPredictionResult> latestRul
) {
    String location = segmentName != null ? segmentName : segmentId;

    String rulText = latestRul
            .map(r -> " RUL tahmini: " + round(nullToZero(r.getRemainingLifeDays()))
                    + " gün, güven aralığı: "
                    + round(nullToZero(r.getConfidenceLowerBound()))
                    + " - "
                    + round(nullToZero(r.getConfidenceUpperBound()))
                    + " gün, bozulma trendi: "
                    + r.getDegradationTrend()
                    + ".")
            .orElse(" RUL tahmini henüz bulunmamaktadır.");

    return "Segment " + location + " için karar destek analizi tamamlanmıştır. "
            + "Risk seviyesi " + severity
            + ", risk skoru " + round(riskScore)
            + ", enerji etkisi " + round(energyImpact)
            + " ve anomali sayısı " + anomalyCount + " olarak hesaplanmıştır."
            + rulText;
}

    private String generateTechnicalExplanation(double temperature, double vibration, double tilt, double speed, double riskScore, double energyImpact, int anomalyCount) {
        return "DSS kararı; sıcaklık, titreşim, eğim, hız, anomali geçmişi ve mevcut risk seviyesi birlikte değerlendirilerek üretilmiştir. "
                + "Değerler: sıcaklık=" + round(temperature)
                + ", titreşim=" + round(vibration)
                + ", eğim=" + round(tilt)
                + ", hız=" + round(speed)
                + ", anomaliSayısı=" + anomalyCount
                + ", riskSkoru=" + round(riskScore)
                + ", enerjiEtkisi=" + round(energyImpact) + ".";
    }

    private String generateMaintenanceRecommendation(DecisionSeverity severity) {
        if (severity == DecisionSeverity.CRITICAL) {
            return "Bu segment için acil bakım önerilmektedir.";
        }

        if (severity == DecisionSeverity.WARNING) {
            return "Bu segment için planlı kontrol ve yakın izleme önerilmektedir.";
        }

        return "Acil bakım gerekmemektedir. Düzenli izleme yeterlidir.";
    }

    private String generateRouteRecommendation(DecisionSeverity severity) {
        if (severity == DecisionSeverity.CRITICAL) {
            return "Bu segment bakım tamamlanana kadar rota planlamasında kullanılmamalıdır.";
        }

        if (severity == DecisionSeverity.WARNING) {
            return "Bu segment yalnızca güvenli alternatif yoksa kullanılmalıdır.";
        }

        return "Bu segment rota planlaması için uygundur.";
    }

    private String generateTechnicalDetails(double temperature, double vibration, double tilt, double speed, int anomalyCount, String riskLevel) {
        return "Formül: 0.25*sıcaklık + 0.25*titreşim + 0.15*eğim + 0.10*hız + 0.15*anomali + 0.10*temelRisk. "
                + "Ham değerler: temperature=" + round(temperature)
                + ", vibration=" + round(vibration)
                + ", tilt=" + round(tilt)
                + ", speed=" + round(speed)
                + ", anomalyCount=" + anomalyCount
                + ", databaseRisk=" + riskLevel + ".";
    }

    private DecisionSupportResponseDto noDataReport(String segmentId) {
        List<String> findings = new ArrayList<>();
        findings.add("Segment " + segmentId + " için telemetri verisi bulunamadı.");

        List<ActionItemDto> actions = new ArrayList<>();
        actions.add(action(DecisionSeverity.WARNING, "Sensör bağlantısını kontrol edin.", "Telemetri verisi olmadan DSS güvenilir karar üretemez."));

        return DecisionSupportResponseDto.builder()
                .segmentId(segmentId)
                .severity(DecisionSeverity.WARNING)
                .riskScore(0.0)
                .estimatedEnergyImpact(0.0)
                .summary("Telemetri verisi bulunamadı.")
                .executiveSummary("Telemetri verisi eksik olduğu için DSS raporu sınırlıdır.")
                .technicalExplanation("Segment için güncel telemetri kaydı alınamadı.")
                .maintenanceRecommendation("Sensör bağlantısı ve MQTT veri akışı kontrol edilmelidir.")
                .routeRecommendation("Veri gelene kadar segment rota planlamasında dikkatli kullanılmalıdır.")
                .keyFindings(findings)
                .recommendedActions(actions)
                .featureContributions(new ArrayList<>())
                .technicalDetails("No telemetry data.")
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private double mapRiskLevel(String riskLevel) {
        if (riskLevel == null) return 0.0;

        String value = riskLevel.toUpperCase();

        if (value.contains("CRITICAL") || value.contains("HIGH")) return 1.0;
        if (value.contains("MEDIUM") || value.contains("WARNING")) return 0.6;
        if (value.contains("LOW")) return 0.3;

        return 0.0;
    }

    private String generateOverviewSummary(String status, int critical, int warning, int normal) {
        if ("CRITICAL".equals(status)) {
            return "Demiryolu ağında kritik riskli segmentler bulunmaktadır. Acil bakım ve rota yeniden planlama önerilir.";
        }

        if ("WARNING".equals(status)) {
            return "Demiryolu ağı çalışmaktadır ancak bazı segmentler yakından izlenmelidir.";
        }

        return "Tüm segmentler normal çalışma koşullarındadır.";
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
    private double nullToZero(Double value) {
    return value == null ? 0.0 : value;
}
}