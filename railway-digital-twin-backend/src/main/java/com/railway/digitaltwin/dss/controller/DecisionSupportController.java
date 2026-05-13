package com.railway.digitaltwin.dss.controller;

import com.railway.digitaltwin.dss.dto.DecisionSupportResponseDto;
import com.railway.digitaltwin.dss.service.DecisionSupportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.railway.digitaltwin.dss.dto.DecisionSupportOverviewDto;
import com.railway.digitaltwin.dss.dto.RouteDecisionReportDto;

@RestController
@RequestMapping("/dss")
@RequiredArgsConstructor
public class DecisionSupportController {

    private final DecisionSupportService decisionSupportService;

    @GetMapping("/segment/{segmentId}")
    public ResponseEntity<DecisionSupportResponseDto> getSegmentDecisionReport(
            @PathVariable String segmentId
    ) {
        return ResponseEntity.ok(decisionSupportService.generateSegmentReport(segmentId));
    }

    @GetMapping("/overview")
    public ResponseEntity<DecisionSupportOverviewDto> getOverviewReport() {
        return ResponseEntity.ok(decisionSupportService.generateOverviewReport());
    }

    @GetMapping("/route-report")
    public ResponseEntity<RouteDecisionReportDto> getRouteDecisionReport() {
        return ResponseEntity.ok(decisionSupportService.generateRouteReport());
    }
}