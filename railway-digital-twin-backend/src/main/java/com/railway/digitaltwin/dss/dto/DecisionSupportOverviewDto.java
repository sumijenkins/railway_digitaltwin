package com.railway.digitaltwin.dss.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DecisionSupportOverviewDto {
    private String overallStatus;
    private String summary;
    private int totalSegments;
    private int criticalCount;
    private int warningCount;
    private int normalCount;
    private List<DecisionSupportResponseDto> segmentReports;
    private List<ActionItemDto> maintenancePriorityList;
    private LocalDateTime generatedAt;
}