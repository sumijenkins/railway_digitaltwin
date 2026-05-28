package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.SensorChannelResponseDto;
import com.railway.digitaltwin.dto.SensorResponseDto;

import com.railway.digitaltwin.repository.TrainLocationRepository;
import com.railway.digitaltwin.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

import java.util.*;

@RestController
@RequestMapping("/sensors")
@RequiredArgsConstructor
public class SensorController {

    private final SensorService sensorService;

    private final TrainLocationRepository trainLocationRepository;

    /** GET /api/sensors */
    @GetMapping
    public ResponseEntity<Page<SensorResponseDto>> getAllSensors(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(sensorService.getAllSensors(pageable));
    }

    /** GET /api/sensors/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<SensorResponseDto> getSensor(@PathVariable Integer id) {
        return ResponseEntity.ok(sensorService.getSensorById(id));
    }

    /** segment sensors */
    @GetMapping("/segment/{segmentId}")
    public ResponseEntity<Page<SensorResponseDto>> getSensorsBySegment(
            @PathVariable String segmentId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(sensorService.getSensorsBySegment(segmentId, pageable));
    }

    /** status sensors */
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<SensorResponseDto>> getSensorsByStatus(
            @PathVariable String status,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(sensorService.getSensorsByStatus(status, pageable));
    }

    /** sensor channels */
    @GetMapping("/{id}/channels")
    public ResponseEntity<Page<SensorChannelResponseDto>> getChannels(
            @PathVariable Integer id,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(sensorService.getChannelsBySensor(id, pageable));
    }

    /** segment channels */
    @GetMapping("/segment/{segmentId}/channels")
    public ResponseEntity<Page<SensorChannelResponseDto>> getChannelsBySegment(
            @PathVariable String segmentId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(sensorService.getChannelsBySegment(segmentId, pageable));
    }

    // =========================================================
    // 🚆 TRAIN LOCATION ENDPOINT (FIXED)
    // =========================================================

    @GetMapping("/trains/locations")
    public List<Map<String, Object>> getTrainLocations() {

        return trainLocationRepository.findAll()
                .stream()
                .filter(t -> t.getLatitude() != null && t.getLongitude() != null)
                .map(t -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("trainId", t.getTrain().getTrainId());
                    m.put("segmentId", t.getSegment() != null ? t.getSegment().getSegmentId() : null);
                    m.put("lat", t.getLatitude());
                    m.put("lon", t.getLongitude());
                    m.put("lastUpdate", t.getLastUpdate());
                    return m;
                })
                .toList();
    }
}