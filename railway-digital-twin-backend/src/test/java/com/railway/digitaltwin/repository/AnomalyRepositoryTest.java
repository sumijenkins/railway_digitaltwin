package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.Anomaly;
import com.railway.digitaltwin.entity.RailwaySegment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
class AnomalyRepositoryTest {

    @Autowired
    private AnomalyRepository anomalyRepository;

    @Autowired
    private RailwaySegmentRepository segmentRepository;

    private RailwaySegment testSegment;

    @BeforeEach
    void setUp() {
        testSegment = RailwaySegment.builder()
                .segmentId("SEG-1")
                .name("Ankara-Istanbul")
                .lengthKm(500.0)
                .riskLevel("MEDIUM")
                .build();
        segmentRepository.save(testSegment);

        Anomaly anomaly1 = Anomaly.builder()
                .segment(testSegment)
                .anomalyType("VIBRATION_SPIKE")
                .severity("HIGH")
                .detectedTime(LocalDateTime.now())
                .build();

        Anomaly anomaly2 = Anomaly.builder()
                .segment(testSegment)
                .anomalyType("TEMPERATURE_SPIKE")
                .severity("LOW")
                .detectedTime(LocalDateTime.now().minusHours(1))
                .build();

        anomalyRepository.save(anomaly1);
        anomalyRepository.save(anomaly2);
    }

    @Test
    void findBySegment_SegmentId_ShouldReturnPaginatedResults() {
        Page<Anomaly> result = anomalyRepository.findBySegment_SegmentId("SEG-1", PageRequest.of(0, 10));

        assertEquals(2, result.getTotalElements());
    }

    @Test
    void findBySeverity_ShouldReturnTargetSeverityOnly() {
        Page<Anomaly> result = anomalyRepository.findBySeverity("HIGH", PageRequest.of(0, 5));

        assertEquals(1, result.getTotalElements());
        assertEquals("VIBRATION_SPIKE", result.getContent().get(0).getAnomalyType());
    }
}
