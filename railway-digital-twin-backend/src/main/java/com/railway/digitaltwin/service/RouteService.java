package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.Route;
import com.railway.digitaltwin.exception.ResourceNotFoundException;
import com.railway.digitaltwin.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class RouteService {

    private final RouteRepository routeRepository;

    /** Tüm rotaları getirir. */
    @Transactional(readOnly = true)
    public Page<Route> getAllRoutes(Pageable pageable) {
        return routeRepository.findAll(pageable);
    }

    /** ID'ye göre tek rota getirir; bulunamazsa 404 fırlatır. */
    @Transactional(readOnly = true)
    public Route getRouteById(Integer routeId) {
        return routeRepository.findById(routeId)
                .orElseThrow(() -> new ResourceNotFoundException("Route", "routeId", routeId));
    }

    /** Optimal olarak işaretlenmiş rotaları getirir. */
    @Transactional(readOnly = true)
    public Page<Route> getOptimalRoutes(Pageable pageable) {
        return routeRepository.findByIsOptimalTrue(pageable);
    }

    /** Başlangıç ve bitiş noktasına göre rota arar. */
    @Transactional(readOnly = true)
    public Page<Route> findRoutes(String startPoint, String endPoint, Pageable pageable) {
        return routeRepository.findByStartPointAndEndPoint(startPoint, endPoint, pageable);
    }

    /** Yeni rota kaydeder veya mevcutu günceller. */
    @Transactional
    public Route saveRoute(Route route) {
        return routeRepository.save(route);
    }

    /** Rotayı siler; bulunamazsa 404 fırlatır. */
    @Transactional
    public void deleteRoute(Integer routeId) {
        if (!routeRepository.existsById(routeId)) {
            throw new ResourceNotFoundException("Route", "routeId", routeId);
        }
        routeRepository.deleteById(routeId);
    }
}
