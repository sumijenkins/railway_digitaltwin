package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.TrainLocationResponseDto;
import com.railway.digitaltwin.dto.TrainResponseDto;
import com.railway.digitaltwin.entity.Train;
import com.railway.digitaltwin.entity.TrainLocation;
import com.railway.digitaltwin.exception.ResourceNotFoundException;
import com.railway.digitaltwin.repository.TrainLocationRepository;
import com.railway.digitaltwin.repository.TrainRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrainService {

    private final TrainRepository trainRepository;
    private final TrainLocationRepository locationRepository;

    @Transactional(readOnly = true)
    public Page<TrainResponseDto> getAllTrains(Pageable pageable) {
        return trainRepository.findAll(pageable).map(this::toTrainDto);
    }

    @Transactional(readOnly = true)
    public TrainResponseDto getTrainById(Integer trainId) {
        return toTrainDto(trainRepository.findById(trainId)
                .orElseThrow(() -> new ResourceNotFoundException("Train", "trainId", trainId)));
    }

    @Transactional(readOnly = true)
    public Page<TrainLocationResponseDto> getAllLocations(Pageable pageable) {
        return locationRepository.findAll(pageable).map(this::toLocationDto);
    }

    @Transactional(readOnly = true)
    public Page<TrainLocationResponseDto> getLocationsBySegment(String segmentId, Pageable pageable) {
        return locationRepository.findBySegment_SegmentId(segmentId, pageable)
                .map(this::toLocationDto);
    }

    @Transactional
    public TrainResponseDto saveTrain(Train train) {
        return toTrainDto(trainRepository.save(train));
    }

    @Transactional
    public void deleteTrain(Integer trainId) {
        if (!trainRepository.existsById(trainId)) {
            throw new ResourceNotFoundException("Train", "trainId", trainId);
        }
        trainRepository.deleteById(trainId);
    }

    // ─── Dönüşüm yardımcıları ───────────────────────────────────────────────

    private TrainResponseDto toTrainDto(Train t) {
        return TrainResponseDto.builder()
                .trainId(t.getTrainId())
                .wagonCount(t.getWagonCount())
                .totalWeight(t.getTotalWeight())
                .currentSpeed(t.getCurrentSpeed())
                .locomotiveId(t.getLocomotive() != null ? t.getLocomotive().getLocomotiveId() : null)
                .locomotiveModel(t.getLocomotive() != null ? t.getLocomotive().getModel() : null)
                .locomotivePowerKw(t.getLocomotive() != null ? t.getLocomotive().getPowerKw() : null)
                .routeId(t.getRoute() != null ? t.getRoute().getRouteId() : null)
                .routeStartPoint(t.getRoute() != null ? t.getRoute().getStartPoint() : null)
                .routeEndPoint(t.getRoute() != null ? t.getRoute().getEndPoint() : null)
                .build();
    }

    private TrainLocationResponseDto toLocationDto(TrainLocation loc) {
        return TrainLocationResponseDto.builder()
                .trainId(loc.getTrainId())
                .latitude(loc.getLatitude())
                .longitude(loc.getLongitude())
                .lastUpdate(loc.getLastUpdate())
                .segmentId(loc.getSegment() != null ? loc.getSegment().getSegmentId() : null)
                .segmentName(loc.getSegment() != null ? loc.getSegment().getName() : null)
                .segmentRiskLevel(loc.getSegment() != null ? loc.getSegment().getRiskLevel() : null)
                .build();
    }
}
