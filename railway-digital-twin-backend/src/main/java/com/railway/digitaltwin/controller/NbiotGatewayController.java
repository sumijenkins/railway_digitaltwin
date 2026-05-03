package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.NbiotSensorPayload;
import com.railway.digitaltwin.service.NbiotGatewayService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/nbiot")
@RequiredArgsConstructor
public class NbiotGatewayController {

    private final NbiotGatewayService nbiotGatewayService;

    @PostMapping("/sensors")
    public ResponseEntity<Map<String, String>> receiveNbiotSensorData(
            @RequestBody NbiotSensorPayload payload
    ) {
        nbiotGatewayService.processNbiotData(payload);

        return ResponseEntity.ok(
                Map.of(
                        "status", "success",
                        "message", "NB-IoT sensor data received and processed"
                )
        );
    }
}