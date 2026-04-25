package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.Locomotive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface LocomotiveRepository extends JpaRepository<Locomotive, Integer> {
    Page<Locomotive> findByStatus(String status, Pageable pageable);
}
