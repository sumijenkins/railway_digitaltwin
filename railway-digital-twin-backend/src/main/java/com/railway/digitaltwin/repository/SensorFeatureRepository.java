package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.SensorFeature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SensorFeatureRepository extends JpaRepository<SensorFeature, Long> {

    // son 20 kayıt (grafik vs için)
    List<SensorFeature> findTop20BySegmentIdOrderByRecordedAtDesc(String segmentId);

    // en son kayıt (senaryo + AI için doğru olan)
    Optional<SensorFeature> findTopBySegmentIdOrderByRecordedAtDesc(String segmentId);

}