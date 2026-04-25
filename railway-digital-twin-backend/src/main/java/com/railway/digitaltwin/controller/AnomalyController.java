package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.AnomalyRequestDto;
import com.railway.digitaltwin.dto.AnomalyResponseDto;
import com.railway.digitaltwin.service.AnomalyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import java.util.List;

@RestController
@RequestMapping("/anomalies")
@RequiredArgsConstructor
public class AnomalyController {

    private final AnomalyService anomalyService;

    /** GET /api/anomalies — tüm anomaliler sayfalama ile */
    @GetMapping
    public ResponseEntity<Page<AnomalyResponseDto>> getAllAnomalies(
            @PageableDefault(sort = "detectedTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anomalyService.getAllAnomalies(pageable));
    }

    /** GET /api/anomalies/segment/{segmentId} */
    @GetMapping("/segment/{segmentId}")
    public ResponseEntity<Page<AnomalyResponseDto>> getBySegment(
            @PathVariable String segmentId,
            @PageableDefault(sort = "detectedTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anomalyService.getAnomaliesBySegment(segmentId, pageable));
    }

    /** GET /api/anomalies/severity/{severity} — HIGH, MEDIUM, LOW */
    @GetMapping("/severity/{severity}")
    public ResponseEntity<Page<AnomalyResponseDto>> getBySeverity(
            @PathVariable String severity,
            @PageableDefault(sort = "detectedTime", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(anomalyService.getAnomaliesBySeverity(severity, pageable));
    }

    /** POST /api/anomalies — yeni anomali kaydı */
    @PostMapping
    public ResponseEntity<AnomalyResponseDto> createAnomaly(@Valid @RequestBody AnomalyRequestDto dto) {
        return ResponseEntity.ok(anomalyService.saveAnomaly(dto));
    }
}
