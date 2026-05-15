package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.SensorFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SensorFeatureRepository extends JpaRepository<SensorFeature, Long> {

    List<SensorFeature> findTop20BySegmentIdOrderByRecordedAtDesc(String segmentId);
    
    // SADECE BU METOD: Entity içindeki 'segmentId' alanı ile tam uyumlu
    Optional<SensorFeature> findTopBySegmentIdOrderByRecordedAtDesc(String segmentId);
}