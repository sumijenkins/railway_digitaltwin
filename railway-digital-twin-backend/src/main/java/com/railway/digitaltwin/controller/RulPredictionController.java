package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.RulPredictionResponseDto;
import com.railway.digitaltwin.entity.SensorFeature;
import com.railway.digitaltwin.service.AIRulPredictionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/rul")
@RequiredArgsConstructor
public class RulPredictionController {

    private final AIRulPredictionService rulPredictionService;
    private final com.railway.digitaltwin.repository.SensorFeatureRepository sensorFeatureRepository;

    @PostMapping("/predict")
    public ResponseEntity<RulPredictionResponseDto> predict(@RequestBody SensorFeature feature) {
        return ResponseEntity.ok(rulPredictionService.predictRul(feature));
    }

    @GetMapping("/predict/{segmentId}")
    public ResponseEntity<RulPredictionResponseDto> predictBySegment(@PathVariable String segmentId) {
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
        return ResponseEntity.ok(rulPredictionService.predictRul(feature));
    }
}