package com.railway.digitaltwin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "locomotive")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Locomotive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "locomotive_id")
    private Integer locomotiveId;

    @Column(name = "model", length = 50)
    private String model;

    @Column(name = "power_kw")
    private Integer powerKw;

    @Column(name = "max_speed")
    private Integer maxSpeed;

    @Column(name = "status", length = 20)
    private String status;
}
