package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.entity.AnomalyResult;
import com.railway.digitaltwin.repository.AnomalyResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/anomaly-results")
@RequiredArgsConstructor
public class AnomalyResultController {

    private final AnomalyResultRepository anomalyResultRepository;

    @GetMapping
    public ResponseEntity<List<AnomalyResult>> getLatestResults() {
        return ResponseEntity.ok(
                anomalyResultRepository.findTop50ByOrderByDetectedAtDesc()
        );
    }
}