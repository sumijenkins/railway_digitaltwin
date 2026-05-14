package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.SensorReadingRequestDto;
import com.railway.digitaltwin.dto.TelemetryResponseDto;
import com.railway.digitaltwin.dto.TelemetryView;
import com.railway.digitaltwin.entity.SensorChannel;
import com.railway.digitaltwin.entity.SensorReading;
import com.railway.digitaltwin.exception.ResourceNotFoundException;
import com.railway.digitaltwin.repository.SensorChannelRepository;
import com.railway.digitaltwin.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.railway.digitaltwin.entity.SensorFeature;

import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TelemetryService {

    private final SensorReadingRepository readingRepository;
    private final SensorChannelRepository channelRepository;
    private final AnomalyService anomalyService;
    private final FeatureExtractionService featureExtractionService;
    private final AIAnomalyDetectionService aiAnomalyDetectionService;

    /**
     * Telemetri kayıtlarını sayfalama ile getirir.
     */
    @Transactional(readOnly = true)
    public Page<TelemetryResponseDto> getLatestTelemetry(Pageable pageable) {
        Page<TelemetryView> views = readingRepository.findLatestTelemetry(pageable);
        return views.map(this::toDto);
    }

    /**
     * Belirli bir segment için telemetri kaydı getirir.
     */
    @Transactional(readOnly = true)
    public Page<TelemetryResponseDto> getLatestBySegment(String segmentId, Pageable pageable) {
        Page<TelemetryView> views = readingRepository.findLatestBySegment(segmentId, pageable);
        return views.map(this::toDto);
    }

    /**
     * Yeni bir sensor reading kaydeder.
     */
    @Transactional
    public TelemetryResponseDto saveReading(SensorReadingRequestDto dto) {
        SensorChannel channel = channelRepository.findById(dto.getChannelId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "SensorChannel", "channelId", dto.getChannelId()));

        SensorReading reading = SensorReading.builder()
                .channel(channel)
                .value(dto.getValue())
                .recordedAt(dto.getRecordedAt() != null ? dto.getRecordedAt() : LocalDateTime.now())
                .build();

        SensorReading saved = readingRepository.save(reading);

        String segmentId = channel.getSensor().getSegment().getSegmentId();
        Integer sensorId = channel.getSensor().getSensorId();

        SensorFeature feature = featureExtractionService.extractLatestFeatures(segmentId, sensorId);

        if (feature != null) {
            aiAnomalyDetectionService.detectAnomaly(feature);
        }

        anomalyService.detectAndSave(
                channel.getSensor().getSegment().getSegmentId(),
                channel.getChannelName(),
                saved.getValue(),
                saved.getRecordedAt()
        );

        // Kaydedilen veriyi döndür (native query ile yeniden çekmemek için manuel dönüştür)
        return TelemetryResponseDto.builder()
                .readingId(saved.getReadingId())
                .recordedAt(saved.getRecordedAt())
                .value(saved.getValue())
                .channelName(channel.getChannelName())
                .unit(channel.getUnit())
                .sensorId(channel.getSensor().getSensorId())
                .sensorType(channel.getSensor().getSensorType())
                .segmentId(channel.getSensor().getSegment().getSegmentId())
                .segmentName(channel.getSensor().getSegment().getName())
                .riskLevel(channel.getSensor().getSegment().getRiskLevel())
                .build();
    }

    // TelemetryView → TelemetryResponseDto dönüşümü
    private TelemetryResponseDto toDto(TelemetryView v) {
        return TelemetryResponseDto.builder()
                .readingId(v.getReadingId())
                .recordedAt(v.getRecordedAt())
                .value(v.getValue())
                .channelName(v.getChannelName())
                .unit(v.getUnit())
                .sensorType(v.getSensorType())
                .sensorId(v.getSensorId())
                .segmentId(v.getSegmentId())
                .segmentName(v.getSegmentName())
                .riskLevel(v.getRiskLevel())
                .build();
    }
}
