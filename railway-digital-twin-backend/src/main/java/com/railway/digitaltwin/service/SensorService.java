package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.SensorChannelResponseDto;
import com.railway.digitaltwin.dto.SensorResponseDto;
import com.railway.digitaltwin.entity.Sensor;
import com.railway.digitaltwin.entity.SensorChannel;
import com.railway.digitaltwin.exception.ResourceNotFoundException;
import com.railway.digitaltwin.repository.SensorChannelRepository;
import com.railway.digitaltwin.repository.SensorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SensorService {

    private final SensorRepository sensorRepository;
    private final SensorChannelRepository channelRepository;

    /** Tüm sensörleri getirir. */
    @Transactional(readOnly = true)
    public Page<SensorResponseDto> getAllSensors(Pageable pageable) {
        return sensorRepository.findAll(pageable).map(this::toSensorDto);
    }

    /** ID'ye göre tek sensör getirir. */
    @Transactional(readOnly = true)
    public SensorResponseDto getSensorById(Integer sensorId) {
        return toSensorDto(sensorRepository.findById(sensorId)
                .orElseThrow(() -> new ResourceNotFoundException("Sensor", "sensorId", sensorId)));
    }

    /** Segmente göre sensörleri getirir. */
    @Transactional(readOnly = true)
    public Page<SensorResponseDto> getSensorsBySegment(String segmentId, Pageable pageable) {
        return sensorRepository.findBySegment_SegmentId(segmentId, pageable)
                .map(this::toSensorDto);
    }

    /** Duruma göre sensörleri filtreler (ACTIVE, FAULT, OFFLINE vb.). */
    @Transactional(readOnly = true)
    public Page<SensorResponseDto> getSensorsByStatus(String status, Pageable pageable) {
        return sensorRepository.findByStatus(status, pageable)
                .map(this::toSensorDto);
    }

    /** Sensöre ait kanalları getirir. */
    @Transactional(readOnly = true)
    public Page<SensorChannelResponseDto> getChannelsBySensor(Integer sensorId, Pageable pageable) {
        if (!sensorRepository.existsById(sensorId)) {
            throw new ResourceNotFoundException("Sensor", "sensorId", sensorId);
        }
        return channelRepository.findBySensor_SensorId(sensorId, pageable)
                .map(this::toChannelDto);
    }

    /** Segmente ait tüm kanalları getirir. */
    @Transactional(readOnly = true)
    public Page<SensorChannelResponseDto> getChannelsBySegment(String segmentId, Pageable pageable) {
        return channelRepository.findBySensor_Segment_SegmentId(segmentId, pageable)
                .map(this::toChannelDto);
    }

    // ─── Dönüşüm yardımcıları ───────────────────────────────────────────────

    private SensorResponseDto toSensorDto(Sensor s) {
        return SensorResponseDto.builder()
                .sensorId(s.getSensorId())
                .sensorType(s.getSensorType())
                .status(s.getStatus())
                .segmentId(s.getSegment() != null ? s.getSegment().getSegmentId() : null)
                .segmentName(s.getSegment() != null ? s.getSegment().getName() : null)
                .build();
    }

    private SensorChannelResponseDto toChannelDto(SensorChannel c) {
        return SensorChannelResponseDto.builder()
                .channelId(c.getChannelId())
                .channelName(c.getChannelName())
                .unit(c.getUnit())
                .sensorId(c.getSensor() != null ? c.getSensor().getSensorId() : null)
                .sensorType(c.getSensor() != null ? c.getSensor().getSensorType() : null)
                .build();
    }

}
