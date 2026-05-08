package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.SensorFeature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SensorFeatureRepository extends JpaRepository<SensorFeature, Long> {

    List<SensorFeature> findTop20BySegmentIdOrderByRecordedAtDesc(String segmentId);
}