package com.railway.digitaltwin.controller;

import com.railway.digitaltwin.entity.RailwaySegment;
import com.railway.digitaltwin.service.SegmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.railway.digitaltwin.dto.SegmentResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;

@RestController
@RequestMapping("/segments")
@RequiredArgsConstructor
public class SegmentController {

    private final SegmentService segmentService;

    @GetMapping
    public ResponseEntity<Page<SegmentResponseDto>> getAllSegments(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(segmentService.getAllSegments(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SegmentResponseDto> getSegment(@PathVariable String id) {
        return ResponseEntity.ok(segmentService.getSegmentById(id));
    }

    @PostMapping
    public ResponseEntity<SegmentResponseDto> createSegment(@RequestBody RailwaySegment segment) {
        return ResponseEntity.ok(segmentService.saveSegment(segment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSegment(@PathVariable String id) {
        segmentService.deleteSegment(id);
        return ResponseEntity.noContent().build();
    }
}