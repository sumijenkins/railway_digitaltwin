package com.example.railwaybackend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "railway_segment")
public class RailwaySegment {

    @Id
    private String segmentId;

    // Additional fields if needed

    // Getters and Setters
    public String getSegmentId() {
        return segmentId;
    }

    public void setSegmentId(String segmentId) {
        this.segmentId = segmentId;
    }
}