package com.railway.digitaltwin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sensor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sensor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sensor_id")
    private Integer sensorId;

    @Column(name = "sensor_type", length = 30)
    private String sensorType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "segment_id")
    @ToString.Exclude
    private RailwaySegment segment;

    @Column(name = "status", length = 10)
    private String status;
}
