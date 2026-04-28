package com.example.railwaybackend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_reading")
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long readingId;

    @ManyToOne
    @JoinColumn(name = "channel_id")
    private SensorChannel channel;

    private Double value;

    private LocalDateTime recordedAt;

    // Getters and Setters
    public Long getReadingId() {
        return readingId;
    }

    public void setReadingId(Long readingId) {
        this.readingId = readingId;
    }

    public SensorChannel getChannel() {
        return channel;
    }

    public void setChannel(SensorChannel channel) {
        this.channel = channel;
    }

    public Double getValue() {
        return value;
    }

    public void setValue(Double value) {
        this.value = value;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }
}