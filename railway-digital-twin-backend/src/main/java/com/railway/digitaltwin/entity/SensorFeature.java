package com.railway.digitaltwin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_feature")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorFeature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long featureId;

    @Column(nullable = false)
    private String segmentId;

    @Column(nullable = false)
    private Integer sensorId;

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    private Double rms;
    private Double peakToPeak;
    private Double fftEnergy;
    private Double slopeGradient;
    private Double meanValue;
    private Double standardDeviation;
    private Double snr;
    private Double dataLossRate;
}