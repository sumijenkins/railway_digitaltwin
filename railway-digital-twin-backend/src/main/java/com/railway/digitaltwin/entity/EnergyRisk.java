package com.railway.digitaltwin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "energy_risk")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnergyRisk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "record_id")
    private Integer recordId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "segment_id")
    @ToString.Exclude
    private RailwaySegment segment;

    @Column(name = "energy_consumption")
    private Double energyConsumption;

    @Column(name = "risk_score")
    private Double riskScore;

    @Column(name = "calculated_time")
    private LocalDateTime calculatedTime;
}
