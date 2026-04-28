package com.example.railwaybackend.dto;

import java.time.LocalDateTime;

public class MqttSensorPayload {

    private String segmentId;
    private String sensorType;
    private String timestamp;
    private Double temperature;
    private Double vibration;
    private Double tilt;

    // Getters and Setters
    public String getSegmentId() {
        return segmentId;
    }

    public void setSegmentId(String segmentId) {
        this.segmentId = segmentId;
    }

    public String getSensorType() {
        return sensorType;
    }

    public void setSensorType(String sensorType) {
        this.sensorType = sensorType;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Double getVibration() {
        return vibration;
    }

    public void setVibration(Double vibration) {
        this.vibration = vibration;
    }

    public Double getTilt() {
        return tilt;
    }

    public void setTilt(Double tilt) {
        this.tilt = tilt;
    }
}