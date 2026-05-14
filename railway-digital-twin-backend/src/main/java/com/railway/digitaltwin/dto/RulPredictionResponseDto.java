package com.railway.digitaltwin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RulPredictionResponseDto {

    private Long rulId;
    private String segmentId;
    private Integer sensorId;
    private Long featureId;
    private LocalDateTime predictedAt;

    private Double remainingLifeDays;
    private Double degradationScore;
    private Double confidence;

    private String condition;
    private String trend;
    private String modelType;
    private String recommendedAction;

    private Double confidenceLowerBound;

    private Double confidenceUpperBound;

    private String degradationTrend;

    private String maintenancePriority;
}