package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.entity.Route;
import com.railway.digitaltwin.service.RouteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/routes")
@RequiredArgsConstructor
public class RouteController {

    private final RouteService routeService;

    /** GET /api/routes — tüm rotalar */
    @GetMapping
    public ResponseEntity<Page<Route>> getAllRoutes(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(routeService.getAllRoutes(pageable));
    }

    /** GET /api/routes/{id} — tek rota */
    @GetMapping("/{id}")
    public ResponseEntity<Route> getRoute(@PathVariable Integer id) {
        return ResponseEntity.ok(routeService.getRouteById(id));
    }

    /** GET /api/routes/optimal — sadece optimal rotalar */
    @GetMapping("/optimal")
    public ResponseEntity<Page<Route>> getOptimalRoutes(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(routeService.getOptimalRoutes(pageable));
    }

    /**
     * GET /api/routes/search?startPoint=Ankara&endPoint=İstanbul
     * Başlangıç ve bitiş noktasına göre rota arar.
     */
    @GetMapping("/search")
    public ResponseEntity<Page<Route>> searchRoutes(
            @RequestParam String startPoint,
            @RequestParam String endPoint,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(routeService.findRoutes(startPoint, endPoint, pageable));
    }

    /** POST /api/routes — yeni rota ekle */
    @PostMapping
    public ResponseEntity<Route> createRoute(@RequestBody Route route) {
        return ResponseEntity.ok(routeService.saveRoute(route));
    }

    /** PUT /api/routes/{id} — rota güncelle */
    @PutMapping("/{id}")
    public ResponseEntity<Route> updateRoute(@PathVariable Integer id, @RequestBody Route route) {
        route.setRouteId(id);
        return ResponseEntity.ok(routeService.saveRoute(route));
    }

    /** DELETE /api/routes/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable Integer id) {
        routeService.deleteRoute(id);
        return ResponseEntity.noContent().build();
    }
}
