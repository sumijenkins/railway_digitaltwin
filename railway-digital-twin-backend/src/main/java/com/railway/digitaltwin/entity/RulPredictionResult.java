package com.railway.digitaltwin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rul_prediction_result")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RulPredictionResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
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

    private Double confidenceLowerBound;

    private Double confidenceUpperBound;

    private String degradationTrend;

    private String maintenancePriority;

    @Column(columnDefinition = "TEXT")
    private String recommendedAction;
}