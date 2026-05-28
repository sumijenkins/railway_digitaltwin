package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.XaiRequestDto;
import com.railway.digitaltwin.entity.SensorFeature;
import com.railway.digitaltwin.service.AIXaiExplanationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/xai")
@RequiredArgsConstructor
public class XaiController {

    private final AIXaiExplanationService xaiExplanationService;
    private final com.railway.digitaltwin.repository.SensorFeatureRepository sensorFeatureRepository;

    @PostMapping("/explain")
    public ResponseEntity<Map<String, Object>> explain(
            @RequestBody XaiRequestDto dto
    ) {
        // Map DTO into a minimal SensorFeature for the service
        SensorFeature feature = new SensorFeature();
        feature.setRms(dto.getRms());
        feature.setPeakToPeak(dto.getPeakToPeak());
        feature.setFftEnergy(dto.getFftEnergy());
        feature.setSlopeGradient(dto.getSlopeGradient());
        feature.setSnr(dto.getSnr());

        return ResponseEntity.ok(
                xaiExplanationService.generateExplanation(feature)
        );
    }

    @GetMapping("/explain/{segmentId}")
    public ResponseEntity<Map<String, Object>> explainBySegment(@PathVariable String segmentId) {
        SensorFeature feature = sensorFeatureRepository.findTopBySegmentIdOrderByRecordedAtDesc(segmentId.toUpperCase())
                .orElseGet(() -> SensorFeature.builder()
                        .segmentId(segmentId.toUpperCase())
                        .sensorId(1)
                        .recordedAt(java.time.LocalDateTime.now())
                        .rms(10.0)
                        .peakToPeak(18.0)
                        .fftEnergy(600.0)
                        .slopeGradient(0.01)
                        .snr(80.0)
                        .build());
        return ResponseEntity.ok(xaiExplanationService.generateExplanation(feature));
    }
}