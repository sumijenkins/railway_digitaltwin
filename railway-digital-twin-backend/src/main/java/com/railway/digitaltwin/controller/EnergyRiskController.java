package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.EnergyRiskResponseDto;
import com.railway.digitaltwin.service.EnergyRiskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/energy-risks")
@RequiredArgsConstructor
public class EnergyRiskController {

    private final EnergyRiskService energyRiskService;

    /** GET /api/energy-risks — tüm enerji risk kayıtları */
    @GetMapping
    public ResponseEntity<Page<EnergyRiskResponseDto>> getAllRisks(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(energyRiskService.getAllEnergyRisks(pageable));
    }

    @GetMapping("/{segmentId}")
    public ResponseEntity<Page<EnergyRiskResponseDto>> getRiskBySegment(
            @PathVariable String segmentId, @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(energyRiskService.getRiskBySegment(segmentId, pageable));
    }
}
