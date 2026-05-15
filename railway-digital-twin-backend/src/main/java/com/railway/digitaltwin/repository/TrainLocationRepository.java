package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.TrainLocation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrainLocationRepository extends JpaRepository<TrainLocation, Integer> {

    Optional<TrainLocation> findByTrain_TrainId(Integer trainId);

    Optional<TrainLocation> findTopByTrain_TrainIdOrderByLastUpdateDesc(Integer trainId);

    Page<TrainLocation> findBySegment_SegmentId(String segmentId, Pageable pageable);

}