package com.example.railwaybackend.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "sensor")
public class Sensor {

    @Id
    private String sensorId; // e.g., "S1"

    private String sensorType; // "RAY_SENSOR"

    @OneToMany(mappedBy = "sensor", cascade = CascadeType.ALL)
    private List<SensorChannel> channels;

    // Getters and Setters
    public String getSensorId() {
        return sensorId;
    }

    public void setSensorId(String sensorId) {
        this.sensorId = sensorId;
    }

    public String getSensorType() {
        return sensorType;
    }

    public void setSensorType(String sensorType) {
        this.sensorType = sensorType;
    }

    public List<SensorChannel> getChannels() {
        return channels;
    }

    public void setChannels(List<SensorChannel> channels) {
        this.channels = channels;
    }
}