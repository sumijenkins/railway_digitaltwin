package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Data JPA Test — Repository Katmanı
 *
 * @DataJpaTest: H2 in-memory veritabanı ile TrainLocationRepository'nin
 * findBySegment_SegmentId sorgusunu doğrular.
 *
 * TrainLocation entity'si Train ile @MapsId (paylaşık PK) ilişkisi kullanır;
 * bu nedenle Locomotive → Train → TrainLocation hiyerarşisi eksiksiz kurulur.
 */
@DataJpaTest
class TrainLocationRepositoryTest {

    @Autowired
    private TrainLocationRepository trainLocationRepository;

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private RailwaySegmentRepository segmentRepository;

    @Autowired
    private LocomotiveRepository locomotiveRepository;

    @Autowired
    private RouteRepository routeRepository;

    private RailwaySegment segmentA;
    private RailwaySegment segmentB;

    @BeforeEach
    void setUp() {
        // Segmentler
        segmentA = segmentRepository.save(RailwaySegment.builder()
                .segmentId("SEG-TL-A")
                .name("Ankara-Eskisehir")
                .lengthKm(300.0)
                .riskLevel("LOW")
                .build());

        segmentB = segmentRepository.save(RailwaySegment.builder()
                .segmentId("SEG-TL-B")
                .name("Eskisehir-Istanbul")
                .lengthKm(350.0)
                .riskLevel("HIGH")
                .build());

        // Locomotive ve Route (Train için gerekli FK'lar)
        Locomotive loco = locomotiveRepository.save(Locomotive.builder()
                .model("E43000")
                .powerKw(5600)
                .maxSpeed(250)
                .status("ACTIVE")
                .build());

        Route route = routeRepository.save(Route.builder()
                .startPoint("Ankara")
                .endPoint("Istanbul")
                .totalEnergy(1200.0)
                .totalRisk(0.3)
                .isOptimal(true)
                .build());

        // SEG-TL-A'da 2 tren
        Train train1 = trainRepository.save(Train.builder()
                .locomotive(loco)
                .route(route)
                .wagonCount(8)
                .totalWeight(450.0)
                .currentSpeed(160.0)
                .build());

        Train train2 = trainRepository.save(Train.builder()
                .locomotive(loco)
                .route(route)
                .wagonCount(6)
                .totalWeight(320.0)
                .currentSpeed(140.0)
                .build());

        // SEG-TL-B'de 1 tren
        Train train3 = trainRepository.save(Train.builder()
                .locomotive(loco)
                .route(route)
                .wagonCount(10)
                .totalWeight(600.0)
                .currentSpeed(180.0)
                .build());

        // TrainLocation kayıtları (@MapsId nedeniyle trainId = train.getTrainId())
        trainLocationRepository.save(TrainLocation.builder()
                .train(train1)
                .segment(segmentA)
                .latitude(39.9334)
                .longitude(32.8597)
                .lastUpdate(LocalDateTime.now())
                .build());

        trainLocationRepository.save(TrainLocation.builder()
                .train(train2)
                .segment(segmentA)
                .latitude(40.0)
                .longitude(33.0)
                .lastUpdate(LocalDateTime.now())
                .build());

        trainLocationRepository.save(TrainLocation.builder()
                .train(train3)
                .segment(segmentB)
                .latitude(41.0)
                .longitude(28.9)
                .lastUpdate(LocalDateTime.now())
                .build());
    }

    @Test
    void findBySegment_SegmentId_ShouldReturnTrainsInSegmentA() {
        // SEG-TL-A'daki 2 tren konumu dönmeli
        Page<TrainLocation> result = trainLocationRepository
                .findBySegment_SegmentId("SEG-TL-A", PageRequest.of(0, 10));

        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().stream()
                .allMatch(tl -> "SEG-TL-A".equals(tl.getSegment().getSegmentId())));
    }

    @Test
    void findBySegment_SegmentId_ShouldReturnTrainsInSegmentB() {
        // SEG-TL-B'deki 1 tren konumu dönmeli
        Page<TrainLocation> result = trainLocationRepository
                .findBySegment_SegmentId("SEG-TL-B", PageRequest.of(0, 10));

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void findBySegment_SegmentId_WhenNoTrains_ShouldReturnEmptyPage() {
        // Var olmayan segment için boş sayfa dönmeli
        Page<TrainLocation> result = trainLocationRepository
                .findBySegment_SegmentId("SEG-NONEXISTENT", PageRequest.of(0, 10));

        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());
    }

    @Test
    void findBySegment_SegmentId_WithPagination_ShouldRespectPageSize() {
        // Sayfalama: SEG-TL-A'da 2 kayıt var, size=1 ile 1 kayıt gelmeli
        Page<TrainLocation> result = trainLocationRepository
                .findBySegment_SegmentId("SEG-TL-A", PageRequest.of(0, 1));

        assertEquals(1, result.getContent().size());
        assertEquals(2, result.getTotalElements());
        assertEquals(2, result.getTotalPages());
    }
}
