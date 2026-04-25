package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.Anomaly;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface AnomalyRepository extends JpaRepository<Anomaly, Integer> {
    Page<Anomaly> findBySegment_SegmentId(String segmentId, Pageable pageable);

    Page<Anomaly> findBySeverity(String severity, Pageable pageable);
}
