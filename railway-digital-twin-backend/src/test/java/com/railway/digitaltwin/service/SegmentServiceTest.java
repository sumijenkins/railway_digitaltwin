package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.SegmentResponseDto;
import com.railway.digitaltwin.entity.RailwaySegment;
import com.railway.digitaltwin.exception.ResourceNotFoundException;
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

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SegmentServiceTest {

    @Mock
    private RailwaySegmentRepository segmentRepository;

    @InjectMocks
    private SegmentService segmentService;

    private RailwaySegment mockSegment;

    @BeforeEach
    void setUp() {
        mockSegment = RailwaySegment.builder()
                .segmentId("SEG-TEST")
                .name("Ankara-Eskisehir")
                .lengthKm(250.0)
                .riskLevel("LOW")
                .build();
    }

    @Test
    void getAllSegments_ShouldReturnPaginatedSegments() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<RailwaySegment> pageResponse = new PageImpl<>(List.of(mockSegment));
        when(segmentRepository.findAll(pageable)).thenReturn(pageResponse);

        // Act
        Page<SegmentResponseDto> result = segmentService.getAllSegments(pageable);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Ankara-Eskisehir", result.getContent().get(0).getName());
        verify(segmentRepository, times(1)).findAll(pageable);
    }

    @Test
    void getSegmentById_WhenExists_ShouldReturnDto() {
        // Arrange
        when(segmentRepository.findById("SEG-TEST")).thenReturn(Optional.of(mockSegment));

        // Act
        SegmentResponseDto result = segmentService.getSegmentById("SEG-TEST");

        // Assert
        assertNotNull(result);
        assertEquals("SEG-TEST", result.getSegmentId());
        assertEquals("LOW", result.getRiskLevel());
        verify(segmentRepository, times(1)).findById("SEG-TEST");
    }

    @Test
    void getSegmentById_WhenNotExists_ShouldThrowResourceNotFoundException() {
        // Arrange
        when(segmentRepository.findById("SEG-99")).thenReturn(Optional.empty());

        // Act & Assert
        Exception exception = assertThrows(ResourceNotFoundException.class, () -> segmentService.getSegmentById("SEG-99"));
        assertTrue(exception.getMessage().contains("RailwaySegment"));
    }

    @Test
    void deleteSegment_WhenExists_ShouldDelete() {
        // Arrange
        when(segmentRepository.existsById("SEG-TEST")).thenReturn(true);
        doNothing().when(segmentRepository).deleteById("SEG-TEST");

        // Act
        assertDoesNotThrow(() -> segmentService.deleteSegment("SEG-TEST"));

        // Assert
        verify(segmentRepository, times(1)).existsById("SEG-TEST");
        verify(segmentRepository, times(1)).deleteById("SEG-TEST");
    }

    @Test
    void deleteSegment_WhenNotExists_ShouldThrowException() {
        // Arrange
        when(segmentRepository.existsById("SEG-99")).thenReturn(false);

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> segmentService.deleteSegment("SEG-99"));
        verify(segmentRepository, never()).deleteById(anyString());
    }
}
