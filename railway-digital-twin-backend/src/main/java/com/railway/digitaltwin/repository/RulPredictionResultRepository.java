package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.RulPredictionResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RulPredictionResultRepository extends JpaRepository<RulPredictionResult, Long> {

    List<RulPredictionResult> findTop20ByOrderByPredictedAtDesc();

    List<RulPredictionResult> findBySegmentIdOrderByPredictedAtDesc(String segmentId);
}