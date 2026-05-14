package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.AnomalyResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface AnomalyResultRepository extends JpaRepository<AnomalyResult, Long> {
    List<AnomalyResult> findTop50ByOrderByDetectedAtDesc();
    long countByIsAnomalyTrue();

}
