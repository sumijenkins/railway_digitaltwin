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

    @PostMapping("/predict")
    public ResponseEntity<RulPredictionResponseDto> predict(@RequestBody SensorFeature feature) {
        return ResponseEntity.ok(rulPredictionService.predictRul(feature));
    }
}