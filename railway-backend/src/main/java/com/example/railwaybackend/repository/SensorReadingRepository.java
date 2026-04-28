package com.example.railwaybackend.repository;

import com.example.railwaybackend.model.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {
}