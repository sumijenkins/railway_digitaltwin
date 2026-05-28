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
    @Column(name = "anomaly_id")
    private Long anomalyId;

    @Column(name = "segment_id")
    private String segmentId;

    @Column(name = "sensor_id")
    private Integer sensorId;

    @Column(name = "detected_at")
    private LocalDateTime detectedAt;

    @Column(name = "anomaly_score")
    private Double anomalyScore;

    @Column(name = "is_anomaly")
    private Boolean isAnomaly;

    @Column(name = "model_type")
    private String modelType;

    @Column(name = "xai_explanation", columnDefinition = "TEXT")
    private String xaiExplanation;

    @Column(name = "severity")
    private String severity;

    @Column(name = "channel_name")
    private String channelName;

    @Column(name = "feature_id")
    private Long featureId;

    public String getDescription() {
        return this.xaiExplanation != null ? this.xaiExplanation : "";
    }
}