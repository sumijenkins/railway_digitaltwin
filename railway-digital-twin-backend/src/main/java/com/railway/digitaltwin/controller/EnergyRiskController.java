package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.EnergyRiskResponseDto;
import com.railway.digitaltwin.service.EnergyRiskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import java.util.List;

@RestController
@RequestMapping("/energy-risks")
@RequiredArgsConstructor
public class EnergyRiskController {

    private final EnergyRiskService energyRiskService;

    /** GET /api/energy-risks — tüm eski enerji risk kayıtları */
    @GetMapping
    public ResponseEntity<Page<EnergyRiskResponseDto>> getAllRisks(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(energyRiskService.getAllEnergyRisks(pageable));
    }

    /** GET /api/energy-risks/current — anlık telemetry verisine göre hesaplama */
    @GetMapping("/current")
    public ResponseEntity<List<EnergyRiskResponseDto>> getCurrentEnergyRisk() {
        return ResponseEntity.ok(energyRiskService.calculateCurrentEnergyRisk());
    }

    /** GET /api/energy-risks/{segmentId} — segmente göre eski kayıtlar */
    @GetMapping("/{segmentId}")
    public ResponseEntity<Page<EnergyRiskResponseDto>> getRiskBySegment(
            @PathVariable String segmentId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(energyRiskService.getRiskBySegment(segmentId, pageable));
    }
}