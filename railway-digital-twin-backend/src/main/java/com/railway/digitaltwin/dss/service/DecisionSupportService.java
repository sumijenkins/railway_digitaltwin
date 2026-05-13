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
                        .action("Inspect segment " + r.getSegmentId())
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

        String selectedRoute = String.join(" → ", selectedSegments);

        String summary = "The selected route was generated by avoiding warning and critical risk segments.";

        String reason = "The DSS selected the route " + selectedRoute
                + " because these segments currently have normal operational severity. "
                + "The following segments were avoided due to elevated risk: "
                + String.join(", ", avoidedSegments) + ".";

        String recommendedAction = riskySegments.isEmpty()
                ? "All segments are currently usable. Continue regular monitoring."
                : "Prefer the selected route and inspect avoided segments before using them for freight transportation.";

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
                            .feature("Database Risk Level")
                            .impact(impact)
                            .explanation(
                                    "The railway segment is marked as "
                                            + riskLevel
                                            + " risk in the operational database."
                            )
                            .build()
            );
        }

        if (temperature > 45) {

            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Train Temperature")
                            .impact("HIGH")
                            .explanation(
                                    "High temperature may increase thermal stress and operational instability."
                            )
                            .build()
            );

        } else {

            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Train Temperature")
                            .impact("LOW")
                            .explanation(
                                    "Temperature values are currently within acceptable operational limits."
                            )
                            .build()
            );
        }

        if (vibration > 2.5) {

            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Train Vibration")
                            .impact("HIGH")
                            .explanation(
                                    "Elevated vibration may indicate rail wear or structural instability."
                            )
                            .build()
            );

        } else {

            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Train Vibration")
                            .impact("LOW")
                            .explanation(
                                    "Vibration levels are currently stable."
                            )
                            .build()
            );
        }

        if (speed > 80) {

            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Train Speed")
                            .impact("MEDIUM")
                            .explanation(
                                    "Higher train speed increases operational risk and energy consumption."
                            )
                            .build()
            );

        } else {

            contributions.add(
                    FeatureContributionDto.builder()
                            .feature("Train Speed")
                            .impact("LOW")
                            .explanation(
                                    "Current train speed is within acceptable operational range."
                            )
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
                + " was evaluated by the Decision Support System. "
                + "The current operational status is " + severity
                + ", with a calculated risk score of " + round(riskScore)
                + " and an estimated energy impact of " + round(energyImpact) + ".";
    }

    private String generateTechnicalExplanation(
            double temperature,
            double vibration,
            double speed,
            double riskScore,
            double energyImpact
    ) {
        return "The decision was generated by combining normalized temperature, vibration, speed, and database risk indicators. "
                + "The risk score represents operational safety, while the estimated energy impact reflects the possible energy cost caused by speed, vibration, and temperature conditions. "
                + "Current values are temperature=" + round(temperature)
                + " °C, vibration=" + round(vibration)
                + " Hz, speed=" + round(speed)
                + " km/h, riskScore=" + round(riskScore)
                + ", energyImpact=" + round(energyImpact) + ".";
    }

    private String generateMaintenanceRecommendation(DecisionSeverity severity) {
        if (severity == DecisionSeverity.CRITICAL) {
            return "Immediate maintenance intervention is recommended before assigning freight traffic to this segment.";
        }

        if (severity == DecisionSeverity.WARNING) {
            return "A scheduled inspection is recommended, and the segment should be monitored closely during operation.";
        }

        return "No immediate maintenance action is required. Regular monitoring is sufficient.";
    }

    private String generateRouteRecommendation(DecisionSeverity severity) {
        if (severity == DecisionSeverity.CRITICAL) {
            return "This segment should be avoided in route planning until maintenance is completed.";
        }

        if (severity == DecisionSeverity.WARNING) {
            return "This segment can be used only if safer alternatives are unavailable; otherwise, alternative segments should be preferred.";
        }

        return "This segment is suitable for route planning under current operating conditions.";
    }
    private DecisionSupportResponseDto noDataReport(String segmentId) {
        List<String> findings = new ArrayList<>();
        findings.add("No telemetry data was found for segment " + segmentId + ".");

        List<ActionItemDto> actions = new ArrayList<>();
        actions.add(ActionItemDto.builder()
                .priority(DecisionSeverity.WARNING)
                .action("Check sensor connectivity.")
                .reason("DSS cannot generate a reliable decision without recent telemetry data.")
                .build());

        return DecisionSupportResponseDto.builder()
                .segmentId(segmentId)
                .severity(DecisionSeverity.WARNING)
                .riskScore(0.0)
                .estimatedEnergyImpact(0.0)
                .featureContributions(new ArrayList<>())
                .executiveSummary("No executive summary could be generated because telemetry data is missing.")
                .technicalExplanation("Technical explanation is unavailable without recent telemetry records.")
                .maintenanceRecommendation("Check sensor connectivity before making maintenance decisions.")
                .routeRecommendation("This segment should not be used for route planning until telemetry data becomes available.")
                .summary("Decision support report could not be generated because no telemetry data was found.")
                .keyFindings(findings)
                .recommendedActions(actions)
                .technicalDetails("Telemetry list is empty.")
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
            return "Segment " + location + " is classified as critical. Immediate operational attention is recommended.";
        }

        if (severity == DecisionSeverity.WARNING) {
            return "Segment " + location + " shows warning-level operational risk. The segment should be monitored closely.";
        }

        return "Segment " + location + " is currently operating under normal conditions.";
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
        findings.add("Average temperature is " + round(temperature) + " °C.");
        findings.add("Average vibration is " + round(vibration) + " Hz.");
        findings.add("Average train speed is " + round(speed) + " km/h.");
        findings.add("Database risk level is " + existingRiskLevel + ".");
        findings.add("Calculated DSS risk score is " + round(riskScore) + ".");
        findings.add("Decision severity is " + severity + ".");

        if (temperature > 50) {
            findings.add("Temperature is higher than the expected operating range.");
        }

        if (vibration > 2.5) {
            findings.add("Vibration level may indicate rail instability or mechanical stress.");
        }

        if (speed > 90) {
            findings.add("Train speed is relatively high for a risk-aware segment evaluation.");
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
                    .action("Perform immediate maintenance inspection.")
                    .reason("The combined DSS risk score exceeds the critical threshold.")
                    .build());
        } else if (severity == DecisionSeverity.WARNING) {
            actions.add(ActionItemDto.builder()
                    .priority(DecisionSeverity.WARNING)
                    .action("Schedule inspection and continue close monitoring.")
                    .reason("The segment has warning-level risk indicators.")
                    .build());
        } else {
            actions.add(ActionItemDto.builder()
                    .priority(DecisionSeverity.NORMAL)
                    .action("Continue regular monitoring.")
                    .reason("Sensor values are currently within acceptable limits.")
                    .build());
        }

        if (temperature > 50) {
            actions.add(ActionItemDto.builder()
                    .priority(DecisionSeverity.WARNING)
                    .action("Inspect temperature-related stress on the segment.")
                    .reason("Temperature increase may affect rail condition and energy efficiency.")
                    .build());
        }

        if (vibration > 2.5) {
            actions.add(ActionItemDto.builder()
                    .priority(DecisionSeverity.WARNING)
                    .action("Inspect possible vibration source.")
                    .reason("Abnormal vibration may indicate rail wear or structural instability.")
                    .build());
        }

        if (speed > 90) {
            actions.add(ActionItemDto.builder()
                    .priority(DecisionSeverity.WARNING)
                    .action("Consider speed reduction on this segment.")
                    .reason("High speed can increase operational risk on sensitive segments.")
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
        return "The DSS risk score was calculated using normalized temperature, vibration, speed, and database risk level. "
                + "Formula: 0.35 × temperature + 0.30 × vibration + 0.15 × speed + 0.20 × baseRisk. "
                + "Values: temperature=" + round(temperature)
                + ", vibration=" + round(vibration)
                + ", speed=" + round(speed)
                + ", baseRisk=" + existingRiskLevel + ".";
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
            return "The railway network contains critical-risk segments. Immediate maintenance planning is recommended.";
        }

        if ("WARNING".equals(overallStatus)) {
            return "The railway network is generally operational, but some segments require close monitoring.";
        }

        return "All railway segments are currently operating under normal conditions.";
    }
}