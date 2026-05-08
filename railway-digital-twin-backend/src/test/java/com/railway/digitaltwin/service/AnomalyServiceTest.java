package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.AnomalyRequestDto;
import com.railway.digitaltwin.dto.AnomalyResponseDto;
import com.railway.digitaltwin.entity.Anomaly;
import com.railway.digitaltwin.entity.RailwaySegment;
import com.railway.digitaltwin.exception.ResourceNotFoundException;
import com.railway.digitaltwin.repository.AnomalyRepository;
import com.railway.digitaltwin.repository.RailwaySegmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnomalyServiceTest {

    @Mock
    private AnomalyRepository anomalyRepository;

    @Mock
    private RailwaySegmentRepository segmentRepository;

    @InjectMocks
    private AnomalyService anomalyService;

    private RailwaySegment mockSegment;
    private Anomaly mockAnomaly;

    @BeforeEach
    void setUp() {
        mockSegment = RailwaySegment.builder()
                .segmentId("SEG-1")
                .name("Ankara-Eskisehir")
                .build();

        mockAnomaly = Anomaly.builder()
                .anomalyId(1)
                .anomalyType("VIBRATION_SPIKE")
                .severity("HIGH")
                .segment(mockSegment)
                .detectedTime(LocalDateTime.now())
                .build();
    }

    @Test
    void getAllAnomalies_ShouldReturnPaginatedList() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Anomaly> pagedAnomalies = new PageImpl<>(List.of(mockAnomaly));
        when(anomalyRepository.findAll(pageable)).thenReturn(pagedAnomalies);

        // Act
        Page<AnomalyResponseDto> result = anomalyService.getAllAnomalies(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("HIGH", result.getContent().get(0).getSeverity());
        verify(anomalyRepository, times(1)).findAll(pageable);
    }

    @Test
    void saveAnomaly_WhenSegmentExists_ShouldSaveAndReturnDto() {
        // Arrange
        AnomalyRequestDto requestDto = new AnomalyRequestDto();
        requestDto.setAnomalyType("VIBRATION_SPIKE");
        requestDto.setSeverity("HIGH");
        requestDto.setSegmentId("SEG-1");

        when(segmentRepository.findById("SEG-1")).thenReturn(Optional.of(mockSegment));
        when(anomalyRepository.save(any(Anomaly.class))).thenReturn(mockAnomaly);

        // Act
        AnomalyResponseDto result = anomalyService.saveAnomaly(requestDto);

        // Assert
        assertNotNull(result);
        assertEquals("VIBRATION_SPIKE", result.getAnomalyType());
        assertEquals("SEG-1", result.getSegmentId());
        verify(segmentRepository, times(1)).findById("SEG-1");
        verify(anomalyRepository, times(1)).save(any(Anomaly.class));
    }

    @Test
    void saveAnomaly_WhenSegmentNotExists_ShouldThrowException() {
        // Arrange
        AnomalyRequestDto requestDto = new AnomalyRequestDto();
        requestDto.setSegmentId("SEG-99");

        when(segmentRepository.findById("SEG-99")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> anomalyService.saveAnomaly(requestDto));
        verify(anomalyRepository, never()).save(any(Anomaly.class));
    }
}
