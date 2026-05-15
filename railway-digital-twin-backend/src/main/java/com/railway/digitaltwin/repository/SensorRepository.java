package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface SensorRepository extends JpaRepository<Sensor, Integer> {
    Page<Sensor> findBySegment_SegmentId(String segmentId, Pageable pageable);

    Page<Sensor> findByStatus(String status, Pageable pageable);

    Optional<Sensor> findBySegment_SegmentIdAndSensorType(String segmentId, String sensorType);

    Optional<Sensor> findByTrain_TrainIdAndSensorType(Integer trainId, String sensorType);

}
