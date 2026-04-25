package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.AnomalyRequestDto;
import com.railway.digitaltwin.dto.AnomalyResponseDto;
import com.railway.digitaltwin.entity.Anomaly;
import com.railway.digitaltwin.exception.ResourceNotFoundException;
import com.railway.digitaltwin.repository.AnomalyRepository;
import com.railway.digitaltwin.repository.RailwaySegmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnomalyService {

    private final AnomalyRepository anomalyRepository;
    private final RailwaySegmentRepository segmentRepository;

    @Transactional(readOnly = true)
    public Page<AnomalyResponseDto> getAllAnomalies(Pageable pageable) {
        return anomalyRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<AnomalyResponseDto> getAnomaliesBySegment(String segmentId, Pageable pageable) {
        return anomalyRepository.findBySegment_SegmentId(segmentId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<AnomalyResponseDto> getAnomaliesBySeverity(String severity, Pageable pageable) {
        return anomalyRepository.findBySeverity(severity, pageable).map(this::toDto);
    }

    @Transactional
    public AnomalyResponseDto saveAnomaly(AnomalyRequestDto dto) {
        var segment = segmentRepository.findById(dto.getSegmentId())
                .orElseThrow(() -> new ResourceNotFoundException("RailwaySegment", "segmentId", dto.getSegmentId()));

        Anomaly anomaly = Anomaly.builder()
                .segment(segment)
                .anomalyType(dto.getAnomalyType())
                .severity(dto.getSeverity())
                .detectedTime(LocalDateTime.now())
                .build();

        return toDto(anomalyRepository.save(anomaly));
    }

    // Entity → DTO dönüşüm yardımcısı (lazy ilişkilere güvenli erişim)
    private AnomalyResponseDto toDto(Anomaly a) {
        return AnomalyResponseDto.builder()
                .anomalyId(a.getAnomalyId())
                .anomalyType(a.getAnomalyType())
                .severity(a.getSeverity())
                .detectedTime(a.getDetectedTime())
                .segmentId(a.getSegment() != null ? a.getSegment().getSegmentId() : null)
                .segmentName(a.getSegment() != null ? a.getSegment().getName() : null)
                .build();
    }
}
