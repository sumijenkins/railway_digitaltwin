package com.railway.digitaltwin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "train")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Train {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "train_id")
    private Integer trainId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "locomotive_id")
    @ToString.Exclude
    private Locomotive locomotive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    @ToString.Exclude
    private Route route;

    @Column(name = "wagon_count")
    private Integer wagonCount;

    @Column(name = "total_weight")
    private Double totalWeight;

    @Column(name = "current_speed")
    private Double currentSpeed;
}
