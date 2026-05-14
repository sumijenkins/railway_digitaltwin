package com.railway.digitaltwin.controller;

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

    @PostMapping("/explain")
    public ResponseEntity<Map<String, Object>> explain(
            @RequestBody SensorFeature feature
    ) {
        return ResponseEntity.ok(
                xaiExplanationService.generateExplanation(feature)
        );
    }
}