package com.example.railwaybackend.repository;

import com.example.railwaybackend.model.SensorChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SensorChannelRepository extends JpaRepository<SensorChannel, Long> {

    List<SensorChannel> findBySensor_SensorId(String sensorId);

    Optional<SensorChannel> findBySensor_SensorIdAndChannelName(String sensorId, String channelName);
}