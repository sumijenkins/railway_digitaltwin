package com.railway.digitaltwin.dss.service;

import com.railway.digitaltwin.dto.TelemetryResponseDto;
import com.railway.digitaltwin.dss.dto.ActionItemDto;
import com.railway.digitaltwin.dss.dto.DecisionSupportResponseDto;
import com.railway.digitaltwin.dss.model.DecisionSeverity;
import com.railway.digitaltwin.service.TelemetryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import com.railway.digitaltwin.dss.dto.DecisionSupportOverviewDto;
import com.railway.digitaltwin.dss.dto.RouteDecisionReportDto;
import com.railway.digitaltwin.dss.dto.FeatureContributionDto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DecisionSupportService {

    private final TelemetryService telemetryService;

    public DecisionSupportResponseDto generateSegmentReport(String segmentId) {

        List<TelemetryResponseDto> telemetryList =
                telemetryService.getLatestBySegment(segmentId, PageRequest.of(0, 50)).getContent();

        if (telemetryList == null || telemetryList.isEmpty()) {
            return noDataReport(segmentId);
        }

        String segmentName = telemetryList.get(0).getSegmentName();
        String existingRiskLevel = telemetryList.get(0).getRiskLevel();

        double avgTemperature = averageByChannel(telemetryList, "temperature");
        double avgVibration = averageByChannel(telemetryList, "vibration");
        double avgSpeed = averageByChannel(telemetryList, "speed");

        double riskScore = calculateRiskScore(avgTemperature, avgVibration, avgSpeed, existingRiskLevel);
        DecisionSeverity severity = determineSeverity(riskScore, existingRiskLevel);

        double estimatedEnergyImpact = calculateEnergyImpact(avgTemperature, avgVibration, avgSpeed);

        return DecisionSupportResponseDto.builder()
                .segmentId(segmentId)
                .severity(severity)
                .riskScore(round(riskScore))
                .summary(generateSummary(segmentId, segmentName, severity))
                .estimatedEnergyImpact(round(estimatedEnergyImpact))
                .executiveSummary(generateExecutiveSummary(segmentId, segmentName, severity, riskScore, estimatedEnergyImpact))
                .technicalExplanation(generateTechnicalExplanation(avgTemperature, avgVibration, avgSpeed, riskScore, estimatedEnergyImpact))
                .maintenanceRecommendation(generateMaintenanceRecommendation(severity))
                .routeRecommendation(generateRouteRecommendation(severity))
                .keyFindings(generateKeyFindings(
                        segmentId,
                        segmentName,
                        avgTemperature,
                        avgVibration,
                        avgSpeed,
                        existingRiskLevel,
                        riskScore,
                        severity
                ))
                .recommendedActions(generateActions(severity, avgTemperature, avgVibration, avgSpeed))
                .featureContributions(
                        generateFeatureContributions(
                                avgTemperature,
                                avgVibration,
                                avgSpeed,
                                existingRiskLevel
                        )
                )
                .technicalDetails(generateTechnicalDetails(avgTemperature, avgVibration, avgSpeed, existingRiskLevel))
                .generatedAt(LocalDateTime.now())
                .build();
    }

    public DecisionSupportOverviewDto generateOverviewReport() {
        List<String> segmentIds = List.of("S1", "S2", "S3", "S4", "S5", "S6");

        List<DecisionSupportResponseDto> reports = segmentIds.stream()
                .map(this::generateSegmentReport)
                .sorted((r1, r2) -> Double.compare(r2.getRiskScore(), r1.getRiskScore()))
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

        String overallStatus;

        if (criticalCount > 0) {
            overallStatus = "CRITICAL";
        } else if (warningCount > 0) {
            overallStatus = "WARNING";
        } else {
            overallStatus = "NORMAL";
        }

        List<ActionItemDto> maintenancePriorityList = reports.stream()
                .filter(r -> r.getSeverity() == DecisionSeverity.CRITICAL
                        || r.getSeverity() == DecisionSeverity.WARNING)
                .map(r -> ActionItemDto.builder()
                        .priority(r.getSeverity())
                        .action("Segment " + r.getSegmentId() + " kontrol edilmelidir.")
                        .reason(r.getSummary())
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

        List<String> routeOrder = List.of("S1", "S2", "S3", "S4", "S5", "S6");

        List<DecisionSupportResponseDto> safeSegments = overview.getSegmentReports().stream()
                .filter(r -> r.getSeverity() == DecisionSeverity.NORMAL)
                .sorted((r1, r2) -> Integer.compare(
                        routeOrder.indexOf(r1.getSegmentId()),
                        routeOrder.indexOf(r2.getSegmentId())
                ))
                .toList();

        List<DecisionSupportResponseDto> riskySegments = overview.getSegmentReports().stream()
                .filter(r -> r.getSeverity() == DecisionSeverity.WARNING
                        || r.getSeverity() == DecisionSeverity.CRITICAL)
                .sorted((r1, r2) -> Integer.compare(
                        routeOrder.indexOf(r1.getSegmentId()),
                        routeOrder.indexOf(r2.getSegmentId())
                ))
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
                ? "Uygun güvenli segment bulunamadı"
                : String.join(" → ", selectedSegments);

        String avoidedText = avoidedSegments.isEmpty()
                ? "Yüksek risk nedeniyle kaçınılan segment bulunmamaktadır."
                : "Yüksek risk nedeniyle kaçınılan segmentler: " + String.join(", ", avoidedSegments) + ".";

        String summary = "Seçilen rota, uyarı ve kritik riskli segmentlerden kaçınılarak oluşturulmuştur.";

        String reason = "Karar Destek Sistemi " + selectedRoute
                + " rotasını seçmiştir. Bu seçim, mevcut operasyonel risk seviyesi normal olan segmentler önceliklendirilerek yapılmıştır. "
                + avoidedText;

        String recommendedAction = riskySegments.isEmpty()
                ? "Tüm segmentler şu anda kullanılabilir durumdadır. Düzenli izlemeye devam edin."
                : "Seçilen rotayı tercih edin ve kaçınılan segmentleri yük taşımacılığı öncesinde kontrol edin.";

        return RouteDecisionReportDto.builder()
                .selectedRoute(selectedRoute)
                .selectedSegments(selectedSegments)
                .avoidedSegments(avoidedSegments)
                .totalRiskScore(round(totalRiskScore))
                .summary(summary)
                .reason(reason)
                .recommendedAction(recommendedAction)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private List<FeatureContributionDto> generateFeatureContributions(
            double temperature,
            double vibration,
            double speed,
            String riskLevel
    ) {

        List<FeatureContributionDto> contributions = new ArrayList<>();

        if (riskLevel != null) {

            String impact = "LOW";

            if (riskLevel.equalsIgnoreCase("MEDIUM")) {
                impact = "MEDIUM";
            }

            if (riskLevel.equalsIgnoreCase("HIGH")
                    || riskLevel.equalsIgnoreCase("CRITICAL")) {
                impact = "HIGH";
            }

            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Veritabanı Risk Seviyesi")
                            .impact(impact)
                            .explanation(
                                    "Demiryolu segmenti operasyonel veritabanında "
                                            + riskLevel
                                            + " risk seviyesinde işaretlenmiştir."
                            )
                            .build()
            );
        }

        if (temperature > 45) {
            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Tren Sıcaklığı")
                            .impact("HIGH")
                            .explanation("Yüksek sıcaklık termal gerilimi ve operasyonel kararsızlığı artırabilir.")
                            .build()
            );
        } else {
            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Tren Sıcaklığı")
                            .impact("LOW")
                            .explanation("Sıcaklık değerleri şu anda kabul edilebilir operasyonel sınırlar içindedir.")
                            .build()
            );
        }

        if (vibration > 2.5) {
            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Tren Titreşimi")
                            .impact("HIGH")
                            .explanation("Yüksek titreşim ray aşınmasına veya yapısal kararsızlığa işaret edebilir.")
                            .build()
            );
        } else {
            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Tren Titreşimi")
                            .impact("LOW")
                            .explanation("Titreşim seviyeleri şu anda kararlı görünmektedir.")
                            .build()
            );
        }

        if (speed > 80) {
            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Tren Hızı")
                            .impact("MEDIUM")
                            .explanation("Yüksek tren hızı operasyonel riski ve enerji tüketimini artırabilir.")
                            .build()
            );
        } else {
            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Tren Hızı")
                            .impact("LOW")
                            .explanation("Mevcut tren hızı kabul edilebilir operasyonel aralıktadır.")
                            .build()
            );
        }

        return contributions;
    }

    private double calculateEnergyImpact(double temperature, double vibration, double speed) {
        double temperatureFactor = Math.min(temperature / 80.0, 1.0);
        double vibrationFactor = Math.min(vibration / 5.0, 1.0);
        double speedFactor = Math.min(speed / 120.0, 1.0);

        return (0.45 * speedFactor)
                + (0.35 * vibrationFactor)
                + (0.20 * temperatureFactor);
    }

    private String generateExecutiveSummary(
            String segmentId,
            String segmentName,
            DecisionSeverity severity,
            double riskScore,
            double energyImpact
    ) {
        String location = segmentName != null ? segmentName : segmentId;

        return "Segment " + location
                + " Karar Destek Sistemi tarafından değerlendirilmiştir. "
                + "Mevcut operasyonel durum " + severity
                + " olarak belirlenmiştir. Hesaplanan risk skoru "
                + round(riskScore)
                + ", tahmini enerji etkisi ise "
                + round(energyImpact) + " değerindedir.";
    }

    private String generateTechnicalExplanation(
            double temperature,
            double vibration,
            double speed,
            double riskScore,
            double energyImpact
    ) {
        return "Bu karar; normalize edilmiş sıcaklık, titreşim, hız ve veritabanı risk göstergeleri birleştirilerek üretilmiştir. "
                + "Risk skoru operasyonel güvenliği temsil ederken, tahmini enerji etkisi hız, titreşim ve sıcaklık koşullarının oluşturabileceği enerji maliyetini yansıtmaktadır. "
                + "Mevcut değerler: sıcaklık=" + round(temperature)
                + " °C, titreşim=" + round(vibration)
                + " Hz, hız=" + round(speed)
                + " km/s, riskSkoru=" + round(riskScore)
                + ", enerjiEtkisi=" + round(energyImpact) + ".";
    }

    private String generateMaintenanceRecommendation(DecisionSeverity severity) {
        if (severity == DecisionSeverity.CRITICAL) {
            return "Bu segmente yük trafiği yönlendirilmeden önce acil bakım müdahalesi önerilmektedir.";
        }

        if (severity == DecisionSeverity.WARNING) {
            return "Planlı bir inceleme yapılması ve segmentin operasyon sırasında yakından izlenmesi önerilmektedir.";
        }

        return "Şu anda acil bakım gerekmemektedir. Düzenli izleme yeterlidir.";
    }

    private String generateRouteRecommendation(DecisionSeverity severity) {
        if (severity == DecisionSeverity.CRITICAL) {
            return "Bakım tamamlanana kadar bu segment rota planlamasında kullanılmamalıdır.";
        }

        if (severity == DecisionSeverity.WARNING) {
            return "Bu segment yalnızca daha güvenli alternatifler yoksa kullanılmalıdır; aksi halde alternatif segmentler tercih edilmelidir.";
        }

        return "Bu segment mevcut operasyonel koşullar altında rota planlaması için uygundur.";
    }

    private DecisionSupportResponseDto noDataReport(String segmentId) {
        List<String> findings = new ArrayList<>();
        findings.add("Segment " + segmentId + " için telemetri verisi bulunamadı.");

        List<ActionItemDto> actions = new ArrayList<>();
        actions.add(ActionItemDto.builder()
                .priority(DecisionSeverity.WARNING)
                .action("Sensör bağlantısını kontrol edin.")
                .reason("Güncel telemetri verisi olmadan DSS güvenilir bir karar üretemez.")
                .build());

        return DecisionSupportResponseDto.builder()
                .segmentId(segmentId)
                .severity(DecisionSeverity.WARNING)
                .riskScore(0.0)
                .estimatedEnergyImpact(0.0)
                .featureContributions(new ArrayList<>())
                .executiveSummary("Telemetri verisi eksik olduğu için yönetici özeti üretilemedi.")
                .technicalExplanation("Güncel telemetri kayıtları olmadan teknik açıklama üretilemez.")
                .maintenanceRecommendation("Bakım kararı vermeden önce sensör bağlantısını kontrol edin.")
                .routeRecommendation("Telemetri verisi elde edilene kadar bu segment rota planlamasında kullanılmamalıdır.")
                .summary("Telemetri verisi bulunamadığı için karar destek raporu üretilemedi.")
                .keyFindings(findings)
                .recommendedActions(actions)
                .technicalDetails("Telemetri listesi boştur.")
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private double averageByChannel(List<TelemetryResponseDto> telemetryList, String keyword) {
        return telemetryList.stream()
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
            double speed,
            String existingRiskLevel
    ) {
        double normalizedTemperature = Math.min(temperature / 80.0, 1.0);
        double normalizedVibration = Math.min(vibration / 5.0, 1.0);
        double normalizedSpeed = Math.min(speed / 120.0, 1.0);
        double baseRisk = mapRiskLevel(existingRiskLevel);

        return (0.35 * normalizedTemperature)
                + (0.30 * normalizedVibration)
                + (0.15 * normalizedSpeed)
                + (0.20 * baseRisk);
    }

    private double mapRiskLevel(String riskLevel) {
        if (riskLevel == null) {
            return 0.0;
        }

        String value = riskLevel.toUpperCase();

        if (value.contains("CRITICAL") || value.contains("HIGH")) {
            return 1.0;
        }

        if (value.contains("MEDIUM") || value.contains("WARNING")) {
            return 0.6;
        }

        if (value.contains("LOW")) {
            return 0.3;
        }

        return 0.0;
    }

    private DecisionSeverity determineSeverity(double riskScore, String existingRiskLevel) {

        if (existingRiskLevel != null) {

            String value = existingRiskLevel.toUpperCase();

            if (value.contains("CRITICAL") || value.contains("HIGH")) {
                return DecisionSeverity.CRITICAL;
            }

            if (value.contains("MEDIUM") || value.contains("WARNING")) {
                return DecisionSeverity.WARNING;
            }
        }

        if (riskScore >= 0.70) {
            return DecisionSeverity.CRITICAL;
        }

        if (riskScore >= 0.40) {
            return DecisionSeverity.WARNING;
        }

        return DecisionSeverity.NORMAL;
    }

    private String generateSummary(String segmentId, String segmentName, DecisionSeverity severity) {
        String location = segmentName != null ? segmentName : segmentId;

        if (severity == DecisionSeverity.CRITICAL) {
            return "Segment " + location + " kritik olarak sınıflandırılmıştır. Acil operasyonel müdahale önerilmektedir.";
        }

        if (severity == DecisionSeverity.WARNING) {
            return "Segment " + location + " uyarı seviyesinde operasyonel risk göstermektedir. Segment yakından izlenmelidir.";
        }

        return "Segment " + location + " şu anda normal çalışma koşullarında çalışmaktadır.";
    }

    private List<String> generateKeyFindings(
            String segmentId,
            String segmentName,
            double temperature,
            double vibration,
            double speed,
            String existingRiskLevel,
            double riskScore,
            DecisionSeverity severity
    ) {
        List<String> findings = new ArrayList<>();

        String location = segmentName != null ? segmentName : segmentId;

        findings.add("Segment: " + location + ".");
        findings.add("Ortalama sıcaklık: " + round(temperature) + " °C.");
        findings.add("Ortalama titreşim: " + round(vibration) + " Hz.");
        findings.add("Ortalama tren hızı: " + round(speed) + " km/s.");
        findings.add("Veritabanı risk seviyesi: " + existingRiskLevel + ".");
        findings.add("Hesaplanan DSS risk skoru: " + round(riskScore) + ".");
        findings.add("Karar önem seviyesi: " + severity + ".");

        if (temperature > 50) {
            findings.add("Sıcaklık beklenen çalışma aralığının üzerindedir.");
        }

        if (vibration > 2.5) {
            findings.add("Titreşim seviyesi ray kararsızlığına veya mekanik strese işaret edebilir.");
        }

        if (speed > 90) {
            findings.add("Tren hızı, risk odaklı segment değerlendirmesi için görece yüksektir.");
        }

        return findings;
    }

    private List<ActionItemDto> generateActions(
            DecisionSeverity severity,
            double temperature,
            double vibration,
            double speed
    ) {
        List<ActionItemDto> actions = new ArrayList<>();

        if (severity == DecisionSeverity.CRITICAL) {
            actions.add(ActionItemDto.builder()
                    .priority(DecisionSeverity.CRITICAL)
                    .action("Acil bakım incelemesi gerçekleştirin.")
                    .reason("Birleşik DSS risk skoru kritik eşiği aşmaktadır.")
                    .build());
        } else if (severity == DecisionSeverity.WARNING) {
            actions.add(ActionItemDto.builder()
                    .priority(DecisionSeverity.WARNING)
                    .action("İnceleme planlayın ve yakın izlemeye devam edin.")
                    .reason("Segment uyarı seviyesinde risk göstergelerine sahiptir.")
                    .build());
        } else {
            actions.add(ActionItemDto.builder()
                    .priority(DecisionSeverity.NORMAL)
                    .action("Düzenli izlemeye devam edin.")
                    .reason("Sensör değerleri şu anda kabul edilebilir sınırlar içindedir.")
                    .build());
        }

        if (temperature > 50) {
            actions.add(ActionItemDto.builder()
                    .priority(DecisionSeverity.WARNING)
                    .action("Segment üzerindeki sıcaklık kaynaklı gerilimi inceleyin.")
                    .reason("Sıcaklık artışı ray durumunu ve enerji verimliliğini etkileyebilir.")
                    .build());
        }

        if (vibration > 2.5) {
            actions.add(ActionItemDto.builder()
                    .priority(DecisionSeverity.WARNING)
                    .action("Olası titreşim kaynağını inceleyin.")
                    .reason("Anormal titreşim ray aşınmasına veya yapısal kararsızlığa işaret edebilir.")
                    .build());
        }

        if (speed > 90) {
            actions.add(ActionItemDto.builder()
                    .priority(DecisionSeverity.WARNING)
                    .action("Bu segmentte hız azaltımını değerlendirin.")
                    .reason("Yüksek hız, hassas segmentlerde operasyonel riski artırabilir.")
                    .build());
        }

        return actions;
    }

    private String generateTechnicalDetails(
            double temperature,
            double vibration,
            double speed,
            String existingRiskLevel
    ) {
        return "DSS risk skoru normalize edilmiş sıcaklık, titreşim, hız ve veritabanı risk seviyesi kullanılarak hesaplanmıştır. "
                + "Formül: 0.35 × sıcaklık + 0.30 × titreşim + 0.15 × hız + 0.20 × temelRisk. "
                + "Değerler: sıcaklık=" + round(temperature)
                + ", titreşim=" + round(vibration)
                + ", hız=" + round(speed)
                + ", temelRisk=" + existingRiskLevel + ".";
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private String generateOverviewSummary(
            String overallStatus,
            int criticalCount,
            int warningCount,
            int normalCount
    ) {
        if ("CRITICAL".equals(overallStatus)) {
            return "Demiryolu ağında kritik riskli segmentler bulunmaktadır. Acil bakım planlaması önerilmektedir.";
        }

        if ("WARNING".equals(overallStatus)) {
            return "Demiryolu ağı genel olarak çalışmaktadır, ancak bazı segmentler yakından izlenmelidir.";
        }

        return "Tüm demiryolu segmentleri şu anda normal çalışma koşullarındadır.";
    }
}