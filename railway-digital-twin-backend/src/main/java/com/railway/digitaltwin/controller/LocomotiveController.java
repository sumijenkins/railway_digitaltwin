package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.entity.Locomotive;
import com.railway.digitaltwin.service.LocomotiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/locomotives")
@RequiredArgsConstructor
public class LocomotiveController {

    private final LocomotiveService locomotiveService;

    /** GET /api/locomotives — tüm lokomotifler */
    @GetMapping
    public ResponseEntity<Page<Locomotive>> getAllLocomotives(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(locomotiveService.getAllLocomotives(pageable));
    }

    /** GET /api/locomotives/{id} — tek lokomotif */
    @GetMapping("/{id}")
    public ResponseEntity<Locomotive> getLocomotive(@PathVariable Integer id) {
        return ResponseEntity.ok(locomotiveService.getLocomotiveById(id));
    }

    /**
     * GET /api/locomotives/status/{status}
     * Duruma göre filtrele: ACTIVE, MAINTENANCE, RETIRED vb.
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<Locomotive>> getByStatus(@PathVariable String status, @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(locomotiveService.getLocomotivesByStatus(status, pageable));
    }

    /** POST /api/locomotives — yeni lokomotif ekle */
    @PostMapping
    public ResponseEntity<Locomotive> createLocomotive(@RequestBody Locomotive locomotive) {
        return ResponseEntity.ok(locomotiveService.saveLocomotive(locomotive));
    }

    /** PUT /api/locomotives/{id} — lokomotif güncelle */
    @PutMapping("/{id}")
    public ResponseEntity<Locomotive> updateLocomotive(@PathVariable Integer id,
                                                        @RequestBody Locomotive locomotive) {
        locomotive.setLocomotiveId(id);
        return ResponseEntity.ok(locomotiveService.saveLocomotive(locomotive));
    }

    /** DELETE /api/locomotives/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLocomotive(@PathVariable Integer id) {
        locomotiveService.deleteLocomotive(id);
        return ResponseEntity.noContent().build();
    }
}
