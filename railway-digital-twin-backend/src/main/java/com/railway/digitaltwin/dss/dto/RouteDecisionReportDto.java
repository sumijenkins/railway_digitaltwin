package com.railway.digitaltwin.dss.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RouteDecisionReportDto {
    private String selectedRoute;
    private List<String> selectedSegments;
    private List<String> avoidedSegments;
    private Double totalRiskScore;
    private String summary;
    private String reason;
    private String recommendedAction;
    private LocalDateTime generatedAt;
}