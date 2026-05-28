package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.SensorReadingRequestDto;
import com.railway.digitaltwin.dto.TelemetryResponseDto;
import com.railway.digitaltwin.service.TelemetryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;



@RestController
@RequestMapping("/telemetry")
@RequiredArgsConstructor
public class TelemetryController {

    private final TelemetryService telemetryService;

    /**
     * GET /api/telemetry
     * Son telemetri kayıtlarını döndürür.
     */
    @GetMapping
    public ResponseEntity<Page<TelemetryResponseDto>> getLatestTelemetry(
            @PageableDefault(size = 50, sort = "recorded_at", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(telemetryService.getLatestTelemetry(pageable));
    }

    /**
     * GET /api/telemetry/{segmentId}
     * Belirli bir segment'e ait son telemetri kayıtlarını döndürür.
     */
    @GetMapping("/{segmentId}")
    public ResponseEntity<Page<TelemetryResponseDto>> getTelemetryBySegment(
            @PathVariable String segmentId,
            @PageableDefault(size = 50, sort = "recorded_at", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(telemetryService.getLatestBySegment(segmentId, pageable));
    }

    /**
     * POST /api/telemetry
     * Yeni bir sensor reading kaydeder.
     * Body: { "channelId": 1, "value": 35.5, "recordedAt": "2025-01-15T12:00:00" }
     */
    @PostMapping
    public ResponseEntity<TelemetryResponseDto> addReading(
            @Valid @RequestBody SensorReadingRequestDto dto) {
        return ResponseEntity.ok(telemetryService.saveReading(dto));
    }
}
