package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface RouteRepository extends JpaRepository<Route, Integer> {
    Page<Route> findByIsOptimalTrue(Pageable pageable);
    Page<Route> findByStartPointAndEndPoint(String startPoint, String endPoint, Pageable pageable);
}
