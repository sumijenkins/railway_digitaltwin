package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.SensorHealthDto;
import com.railway.digitaltwin.service.SensorHealthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sensor-health")
@RequiredArgsConstructor
public class SensorHealthController {

    private final SensorHealthService sensorHealthService;

    @GetMapping
    public ResponseEntity<List<SensorHealthDto>> getSensorHealth() {
        return ResponseEntity.ok(sensorHealthService.getSensorHealth());
    }
}