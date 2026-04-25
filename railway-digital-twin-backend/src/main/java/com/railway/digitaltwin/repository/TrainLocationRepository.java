package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.TrainLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface TrainLocationRepository extends JpaRepository<TrainLocation, Integer> {
    Page<TrainLocation> findBySegment_SegmentId(String segmentId, Pageable pageable);
}
