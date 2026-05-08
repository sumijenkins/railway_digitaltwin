package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.RailwaySegment;
import com.railway.digitaltwin.entity.Sensor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Data JPA Test — Repository Katmanı
 *
 * @DataJpaTest: Sadece JPA bileşenlerini yükler; H2 in-memory veritabanı
 *               kullanarak
 *               SQL sorgularının doğru çalıştığını saniyeler içinde doğrular.
 */
@DataJpaTest
class SensorRepositoryTest {

        @Autowired
        private SensorRepository sensorRepository;

        @Autowired
        private RailwaySegmentRepository segmentRepository;

        private RailwaySegment testSegment;

        @BeforeEach
        void setUp() {
                // Test segmenti oluştur
                testSegment = RailwaySegment.builder()
                                .segmentId("SEG-SNR") // max 10 karakter (VARCHAR(10))
                                .name("Test Hattı")
                                .lengthKm(100.0)
                                .riskLevel("LOW")
                                .build();
                segmentRepository.save(testSegment);

                // Farklı tip ve statüde sensörler kaydet
                sensorRepository.save(Sensor.builder()
                                .sensorType("VIBRATION")
                                .status("ACTIVE")
                                .segment(testSegment)
                                .build());

                sensorRepository.save(Sensor.builder()
                                .sensorType("TEMPERATURE")
                                .status("ACTIVE")
                                .segment(testSegment)
                                .build());

                sensorRepository.save(Sensor.builder()
                                .sensorType("PRESSURE")
                                .status("FAULT")
                                .segment(testSegment)
                                .build());
        }

        @Test
        void findBySegment_SegmentId_ShouldReturnAllSensorsInSegment() {
                // Segmentteki tüm sensörler (3 adet) dönmeli
                Page<Sensor> result = sensorRepository.findBySegment_SegmentId(
                                "SEG-SNR", PageRequest.of(0, 10));

                assertEquals(3, result.getTotalElements());
        }

        @Test
        void findByStatus_ACTIVE_ShouldReturnOnlyActiveSensors() {
                // Sadece ACTIVE statüsündeki 2 sensör dönmeli
                Page<Sensor> result = sensorRepository.findByStatus("ACTIVE", PageRequest.of(0, 10));

                assertEquals(2, result.getTotalElements());
                assertTrue(result.getContent().stream()
                                .allMatch(s -> "ACTIVE".equals(s.getStatus())));
        }

        @Test
        void findByStatus_FAULT_ShouldReturnOnlyFaultedSensors() {
                // Sadece FAULT statüsündeki 1 sensör dönmeli
                Page<Sensor> result = sensorRepository.findByStatus("FAULT", PageRequest.of(0, 10));

                assertEquals(1, result.getTotalElements());
                assertEquals("PRESSURE", result.getContent().get(0).getSensorType());
        }

        @Test
        void findBySegment_AndSensorType_ShouldReturnMatchingSensor() {
                // Belirli segmentte VIBRATION tipi sensör bulunmalı
                Optional<Sensor> result = sensorRepository
                                .findBySegment_SegmentIdAndSensorType("SEG-SNR", "VIBRATION");

                assertTrue(result.isPresent());
                assertEquals("VIBRATION", result.get().getSensorType());
        }

        @Test
        void findBySegment_AndSensorType_WhenNotExists_ShouldReturnEmpty() {
                // Var olmayan bir kombinasyon için boş Optional dönmeli
                Optional<Sensor> result = sensorRepository
                                .findBySegment_SegmentIdAndSensorType("SEG-SNR", "RADAR");

                assertFalse(result.isPresent());
        }
}
