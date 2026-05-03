package com.railway.digitaltwin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "anomaly")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Anomaly {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "anomaly_id")
    private Integer anomalyId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "segment_id")
    @ToString.Exclude
    private RailwaySegment segment;

    @Column(name = "anomaly_type", length = 50)
    private String anomalyType;

    @Column(name = "severity", length = 20)
    private String severity;

    @Column(name = "detected_time")
    private LocalDateTime detectedTime;

    @Column(name = "measured_value")
    private Double measuredValue;

    @Column(name = "threshold_value")
    private Double thresholdValue;

    @Column(name = "description", length = 255)
    private String description;
}