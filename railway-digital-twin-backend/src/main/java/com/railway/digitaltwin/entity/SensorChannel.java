package com.railway.digitaltwin.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sensor_channel")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorChannel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "channel_id")
    private Integer channelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sensor_id")
    @ToString.Exclude
    private Sensor sensor;

    @Column(name = "channel_name", length = 30)
    private String channelName;

    @Column(name = "unit", length = 10)
    private String unit;
}
