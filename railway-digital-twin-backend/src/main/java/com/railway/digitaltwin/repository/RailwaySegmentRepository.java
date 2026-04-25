package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.RailwaySegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RailwaySegmentRepository extends JpaRepository<RailwaySegment, String> {
}
