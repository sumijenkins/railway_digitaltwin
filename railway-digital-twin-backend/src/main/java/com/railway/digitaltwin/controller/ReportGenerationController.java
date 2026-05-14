package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.dto.GeneratedReportDto;
import com.railway.digitaltwin.service.ReportGenerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportGenerationController {

    private final ReportGenerationService reportGenerationService;

    @PostMapping("/generate")
    public ResponseEntity<GeneratedReportDto> generateReport(
            @RequestParam(defaultValue = "EXECUTIVE") String type
    ) {

        return ResponseEntity.ok(
                reportGenerationService.generateReport(type)
        );
    }
}