package com.railway.digitaltwin.dss.dto;

import com.railway.digitaltwin.dss.model.DecisionSeverity;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DecisionSupportResponseDto {
    private String segmentId;
    private DecisionSeverity severity;
    private Double riskScore;
    private String summary;
    private List<String> keyFindings;
    private List<ActionItemDto> recommendedActions;
    private List<FeatureContributionDto> featureContributions; 
    private String technicalDetails;
    private LocalDateTime generatedAt;
    private Double estimatedEnergyImpact;
    private String executiveSummary;
    private String technicalExplanation;
    private String maintenanceRecommendation;
    private String routeRecommendation;
}