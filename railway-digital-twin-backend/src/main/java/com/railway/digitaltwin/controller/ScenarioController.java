package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.ScenarioRequestDto;
import com.railway.digitaltwin.dto.ScenarioResponseDto;
import com.railway.digitaltwin.entity.SensorFeature;
import com.railway.digitaltwin.service.ScenarioService;
import lombok.RequiredArgsConstructor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/scenario")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ScenarioController {

    private final ScenarioService scenarioService;

    @PostMapping("/simulate")
    public ResponseEntity<?> simulateScenario(@RequestBody ScenarioRequestDto scenarioRequestDto) {
        try {
            ScenarioResponseDto response = scenarioService.simulateScenario(scenarioRequestDto);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Konsola detaylı hatayı yazdır
            return ResponseEntity.status(500).body("Simülasyon hatası: " + e.getMessage());
        }
    }

    @GetMapping("/latest/{segmentId}")
    public ResponseEntity<?> getLatestData(@PathVariable String segmentId) {
        try {
            SensorFeature feature = scenarioService.getLatestFeatureForSegment(segmentId);
            java.util.Map<String, Object> response = new java.util.HashMap<>();

            if (feature == null) {
                response.put("status", "NO_DATA");
                return ResponseEntity.ok(response);
            }

            response.put("status", "OK");
            response.put("data", feature);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Veri çekme hatası (Segment: {}): {}", segmentId, e.getMessage(), e);
            return ResponseEntity.status(500).body("Veri çekme hatası: " + e.getMessage());
        }
    }
}