package com.example.railwaybackend.repository;

import com.example.railwaybackend.model.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SensorRepository extends JpaRepository<Sensor, String> {

    Optional<Sensor> findBySensorId(String sensorId);
}