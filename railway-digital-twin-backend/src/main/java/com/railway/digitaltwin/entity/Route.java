package com.railway.digitaltwin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "route")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "route_id")
    private Integer routeId;

    @Column(name = "start_point", length = 50)
    private String startPoint;

    @Column(name = "end_point", length = 50)
    private String endPoint;

    @Column(name = "total_energy")
    private Double totalEnergy;

    @Column(name = "total_risk")
    private Double totalRisk;

    @Column(name = "is_optimal")
    private Boolean isOptimal;

    @Column(name = "segment_path", length = 500)
    private String segmentPath; // comma separated segment ids e.g. "S1,S2,S3"

    @Column(name = "route_rank")
    private Integer rank;
}
