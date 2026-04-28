package com.example.railwaybackend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sensor_channel")
public class SensorChannel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long channelId;

    @ManyToOne
    @JoinColumn(name = "sensor_id")
    private Sensor sensor;

    private String channelName; // "ray_temperature", "ray_vibration_x", "rail_slope"

    private String unit;

    // Getters and Setters
    public Long getChannelId() {
        return channelId;
    }

    public void setChannelId(Long channelId) {
        this.channelId = channelId;
    }

    public Sensor getSensor() {
        return sensor;
    }

    public void setSensor(Sensor sensor) {
        this.sensor = sensor;
    }

    public String getChannelName() {
        return channelName;
    }

    public void setChannelName(String channelName) {
        this.channelName = channelName;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }
}