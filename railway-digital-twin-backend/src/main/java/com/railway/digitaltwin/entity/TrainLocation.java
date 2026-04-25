package com.railway.digitaltwin.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "train_location")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainLocation {

    // Shared PK with train (train_id is both PK and FK)
    @Id
    @Column(name = "train_id")
    private Integer trainId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "train_id")
    @ToString.Exclude
    private Train train;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "segment_id")
    @ToString.Exclude
    private RailwaySegment segment;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "last_update")
    private LocalDateTime lastUpdate;
}
