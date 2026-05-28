package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.SegmentResponseDto;
import com.railway.digitaltwin.entity.RailwaySegment;
import com.railway.digitaltwin.exception.ResourceNotFoundException;
import com.railway.digitaltwin.repository.RailwaySegmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class SegmentService {

    private final RailwaySegmentRepository segmentRepository;

    @Transactional(readOnly = true)
    public Page<SegmentResponseDto> getAllSegments(Pageable pageable) {
        return segmentRepository.findAll(pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public SegmentResponseDto getSegmentById(String segmentId) {
        return toDto(segmentRepository.findById(segmentId)
                .orElseThrow(() -> new ResourceNotFoundException("RailwaySegment", "segmentId", segmentId)));
    }

    @Transactional
    public SegmentResponseDto saveSegment(RailwaySegment segment) {
        return toDto(segmentRepository.save(segment));
    }

    @Transactional
    public SegmentResponseDto updateSegment(String segmentId, RailwaySegment updated) {
        if (!segmentRepository.existsById(segmentId)) {
            throw new ResourceNotFoundException("RailwaySegment", "segmentId", segmentId);
        }
        updated.setSegmentId(segmentId);
        return toDto(segmentRepository.save(updated));
    }

    @Transactional
    public void deleteSegment(String segmentId) {
        if (!segmentRepository.existsById(segmentId)) {
            throw new ResourceNotFoundException("RailwaySegment", "segmentId", segmentId);
        }
        segmentRepository.deleteById(segmentId);
    }

    private SegmentResponseDto toDto(RailwaySegment s) {
        return SegmentResponseDto.builder()
                .segmentId(s.getSegmentId())
                .name(s.getName())
                .lengthKm(s.getLengthKm())
                .riskLevel(s.getRiskLevel())
                .build();
    }
}
