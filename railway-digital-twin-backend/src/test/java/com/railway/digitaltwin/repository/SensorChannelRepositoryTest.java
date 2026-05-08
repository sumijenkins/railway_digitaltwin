package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.RailwaySegment;
import com.railway.digitaltwin.entity.Sensor;
import com.railway.digitaltwin.entity.SensorChannel;
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
 * @DataJpaTest: H2 in-memory veritabanı ile SensorChannelRepository'nin
 * tüm özel sorgularını doğrular.
 */
@DataJpaTest
class SensorChannelRepositoryTest {

    @Autowired
    private SensorChannelRepository sensorChannelRepository;

    @Autowired
    private SensorRepository sensorRepository;

    @Autowired
    private RailwaySegmentRepository segmentRepository;

    private Sensor testSensor;

    @BeforeEach
    void setUp() {
        // Segment → Sensor → SensorChannel hiyerarşisini kur
        RailwaySegment segment = RailwaySegment.builder()
                .segmentId("SEG-CH")  // max 10 karakter (VARCHAR(10))
                .name("Kanal Test Hattı")
                .lengthKm(50.0)
                .riskLevel("MEDIUM")
                .build();
        segmentRepository.save(segment);

        testSensor = Sensor.builder()
                .sensorType("TEMPERATURE")
                .status("ACTIVE")
                .segment(segment)
                .build();
        sensorRepository.save(testSensor);

        // Aynı sensöre ait iki farklı kanal
        sensorChannelRepository.save(SensorChannel.builder()
                .channelName("CH-TEMP-AIR")
                .unit("°C")
                .sensor(testSensor)
                .build());

        sensorChannelRepository.save(SensorChannel.builder()
                .channelName("CH-TEMP-RAIL")
                .unit("°C")
                .sensor(testSensor)
                .build());
    }

    @Test
    void findBySensor_SensorId_ShouldReturnAllChannelsForSensor() {
        // Bir sensöre ait 2 kanal dönmeli
        Page<SensorChannel> result = sensorChannelRepository
                .findBySensor_SensorId(testSensor.getSensorId(), PageRequest.of(0, 10));

        assertEquals(2, result.getTotalElements());
    }

    @Test
    void findBySensor_Segment_SegmentId_ShouldReturnChannelsInSegment() {
        // Segment bazlı sorgu da doğru çalışmalı
        Page<SensorChannel> result = sensorChannelRepository
                .findBySensor_Segment_SegmentId("SEG-CH", PageRequest.of(0, 10));

        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().stream()
                .allMatch(ch -> "°C".equals(ch.getUnit())));
    }

    @Test
    void findBySensor_SensorIdAndChannelName_WhenExists_ShouldReturnChannel() {
        // SensorId + ChannelName kombinasyonu ile kanal bulunmalı
        Optional<SensorChannel> result = sensorChannelRepository
                .findBySensor_SensorIdAndChannelName(testSensor.getSensorId(), "CH-TEMP-AIR");

        assertTrue(result.isPresent());
        assertEquals("CH-TEMP-AIR", result.get().getChannelName());
    }

    @Test
    void findBySensor_SensorIdAndChannelName_WhenNotExists_ShouldReturnEmpty() {
        // Var olmayan kanal adı için boş Optional dönmeli
        Optional<SensorChannel> result = sensorChannelRepository
                .findBySensor_SensorIdAndChannelName(testSensor.getSensorId(), "CH-PRESSURE");

        assertFalse(result.isPresent());
    }

    @Test
    void findBySensor_SensorId_WithPagination_ShouldRespectPageSize() {
        // Sayfalama: size=1 ile sadece 1 kayıt gelmeli, toplam 2 olmalı
        Page<SensorChannel> result = sensorChannelRepository
                .findBySensor_SensorId(testSensor.getSensorId(), PageRequest.of(0, 1));

        assertEquals(1, result.getContent().size());
        assertEquals(2, result.getTotalElements());
        assertEquals(2, result.getTotalPages());
    }
}
