package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.SensorChannelResponseDto;
import com.railway.digitaltwin.dto.SensorResponseDto;
import com.railway.digitaltwin.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import java.util.List;

@RestController
@RequestMapping("/sensors")
@RequiredArgsConstructor
public class SensorController {

    private final SensorService sensorService;

    /** GET /api/sensors — tüm sensörler */
    @GetMapping
    public ResponseEntity<Page<SensorResponseDto>> getAllSensors(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(sensorService.getAllSensors(pageable));
    }

    /** GET /api/sensors/{id} — tek sensör */
    @GetMapping("/{id}")
    public ResponseEntity<SensorResponseDto> getSensor(@PathVariable Integer id) {
        return ResponseEntity.ok(sensorService.getSensorById(id));
    }

    /**
     * GET /api/sensors/segment/{segmentId}
     * Belirli segmentteki tüm sensörler
     */
    @GetMapping("/segment/{segmentId}")
    public ResponseEntity<Page<SensorResponseDto>> getSensorsBySegment(
            @PathVariable String segmentId, @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(sensorService.getSensorsBySegment(segmentId, pageable));
    }

    /**
     * GET /api/sensors/status/{status}
     * Duruma göre filtrele: ACTIVE, FAULT, OFFLINE vb.
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<SensorResponseDto>> getSensorsByStatus(
            @PathVariable String status, @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(sensorService.getSensorsByStatus(status, pageable));
    }

    /**
     * GET /api/sensors/{id}/channels
     * Sensöre ait kanallar
     */
    @GetMapping("/{id}/channels")
    public ResponseEntity<Page<SensorChannelResponseDto>> getChannels(
            @PathVariable Integer id, @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(sensorService.getChannelsBySensor(id, pageable));
    }

    /**
     * GET /api/sensors/segment/{segmentId}/channels
     * Segmentteki tüm kanallar
     */
    @GetMapping("/segment/{segmentId}/channels")
    public ResponseEntity<Page<SensorChannelResponseDto>> getChannelsBySegment(
            @PathVariable String segmentId, @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(sensorService.getChannelsBySegment(segmentId, pageable));
    }
}
