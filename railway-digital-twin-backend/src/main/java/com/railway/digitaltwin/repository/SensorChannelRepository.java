package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.SensorChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface SensorChannelRepository extends JpaRepository<SensorChannel, Integer> {
    Page<SensorChannel> findBySensor_SensorId(Integer sensorId, Pageable pageable);
    Page<SensorChannel> findBySensor_Segment_SegmentId(String segmentId, Pageable pageable);
    Optional<SensorChannel> findBySensor_SensorIdAndChannelName(Integer sensorId, String channelName);
}
