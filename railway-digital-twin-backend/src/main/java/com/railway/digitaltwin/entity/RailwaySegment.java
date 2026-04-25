package com.railway.digitaltwin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "railway_segment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RailwaySegment {

    @Id
    @Column(name = "segment_id", length = 10)
    private String segmentId;

    @Column(name = "name", length = 50)
    private String name;

    @Column(name = "length_km")
    private Double lengthKm;

    @Column(name = "risk_level", length = 10)
    private String riskLevel;
}
