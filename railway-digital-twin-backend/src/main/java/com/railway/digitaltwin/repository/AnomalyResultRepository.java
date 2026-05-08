package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.AnomalyResult;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnomalyResultRepository extends JpaRepository<AnomalyResult, Long> {
}