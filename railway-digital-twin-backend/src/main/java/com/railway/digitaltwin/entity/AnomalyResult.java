package com.railway.digitaltwin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "anomaly_result")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnomalyResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long anomalyId;

    private String segmentId;

    private Integer sensorId;

    private LocalDateTime detectedAt;

    private Double anomalyScore;

    private Boolean isAnomaly;

    private String modelType; // IsolationForest / LSTM / RuleBased

    private String severity;

    private String channelName;

    private Long featureId;
}