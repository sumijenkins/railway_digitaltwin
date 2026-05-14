package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.AnomalyRequestDto;
import com.railway.digitaltwin.dto.AnomalyResponseDto;
import com.railway.digitaltwin.entity.Anomaly;
import com.railway.digitaltwin.entity.RailwaySegment;
import com.railway.digitaltwin.exception.ResourceNotFoundException;
import com.railway.digitaltwin.repository.AnomalyRepository;
import com.railway.digitaltwin.repository.RailwaySegmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
        RailwaySegment segment = segmentRepository.findById(dto.getSegmentId())
                .orElseThrow(() -> new ResourceNotFoundException("RailwaySegment", "segmentId", dto.getSegmentId()));

        Anomaly anomaly = Anomaly.builder()
                .segment(segment)
                .anomalyType(dto.getAnomalyType())
                .severity(dto.getSeverity())
                .detectedTime(LocalDateTime.now())
                .build();

        return toDto(anomalyRepository.save(anomaly));
    }

    @Transactional
    public void detectAndSave(String segmentId, String channelName, Double value, LocalDateTime recordedAt) {
        if (segmentId == null || channelName == null || value == null) {
            return;
        }

        RailwaySegment segment = segmentRepository.findById(segmentId).orElse(null);
        if (segment == null) {
            return;
        }

        if (channelName.equals("ray_temperature") && value > 40.0) {
            saveDetectedAnomaly(
                    segment,
                    "Critical Temperature",
                    "HIGH",
                    value,
                    40.0,
                    recordedAt
            );
        }

        if (channelName.equals("ray_vibration_x") && value > 2.5) {
            saveDetectedAnomaly(
                    segment,
                    "High Rail Vibration",
                    "HIGH",
                    value,
                    2.5,
                    recordedAt
            );
        }

        if (channelName.equals("rail_slope") && Math.abs(value) > 3.0) {
            saveDetectedAnomaly(
                    segment,
                    "Abnormal Rail Slope",
                    "MEDIUM",
                    value,
                    3.0,
                    recordedAt
            );
        }

        if (channelName.equals("train_speed") && value > 85.0) {
            saveDetectedAnomaly(
                    segment,
                    "Speed Limit Exceeded",
                    "MEDIUM",
                    value,
                    85.0,
                    recordedAt
            );
        }
    }

    private void saveDetectedAnomaly(
            RailwaySegment segment,
            String anomalyType,
            String severity,
            Double measuredValue,
            Double thresholdValue,
            LocalDateTime detectedTime
    ) {
        Anomaly anomaly = Anomaly.builder()
                .segment(segment)
                .anomalyType(anomalyType)
                .severity(severity)
                .measuredValue(measuredValue)
                .thresholdValue(thresholdValue)
                .detectedTime(detectedTime != null ? detectedTime : LocalDateTime.now())
                .description(generateDescription(segment.getSegmentId(), anomalyType, measuredValue, thresholdValue))
                .build();

        anomalyRepository.save(anomaly);
    }

    private String generateDescription(String segmentId, String anomalyType, Double value, Double threshold) {
        return anomalyType + " detected on segment " + segmentId +
                ". Measured value: " + String.format("%.2f", value) +
                ", threshold: " + threshold + ".";
    }

    private AnomalyResponseDto toDto(Anomaly a) {
        return AnomalyResponseDto.builder()
                .anomalyId(a.getAnomalyId())
                .anomalyType(a.getAnomalyType())
                .severity(a.getSeverity())
                .detectedTime(a.getDetectedTime())
                .segmentId(a.getSegment() != null ? a.getSegment().getSegmentId() : null)
                .segmentName(a.getSegment() != null ? a.getSegment().getName() : null)
                .measuredValue(a.getMeasuredValue())
                .thresholdValue(a.getThresholdValue())
                .description(a.getDescription())
                .build();
    }
}