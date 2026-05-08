package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.dto.TelemetryView;
import com.railway.digitaltwin.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    /**
     * Son N telemetri kaydını segment, sensor ve kanal bilgileriyle çeker.
     * Native SQL ile JOIN yaparak flat bir projeksiyon döndürür.
     */
    @Query(value = """
            SELECT
                sr.reading_id   AS readingId,
                sr.recorded_at  AS recordedAt,
                sr.value        AS value,
                sc.channel_name AS channelName,
                sc.unit         AS unit,
                s.sensor_type   AS sensorType,
                s.sensor_id     AS sensorId,
                rs.segment_id   AS segmentId,
                rs.name         AS segmentName,
                rs.risk_level   AS riskLevel
            FROM sensor_reading sr
            JOIN sensor_channel sc ON sr.channel_id = sc.channel_id
            JOIN sensor          s  ON sc.sensor_id  = s.sensor_id
            JOIN railway_segment rs ON s.segment_id  = rs.segment_id
            ORDER BY sr.recorded_at DESC
            """, countQuery = "SELECT count(*) FROM sensor_reading", nativeQuery = true)
    Page<TelemetryView> findLatestTelemetry(Pageable pageable);

    /**
     * Belirli bir segment için son N kaydı getirir.
     */
    @Query(value = """
            SELECT
                sr.reading_id   AS readingId,
                sr.recorded_at  AS recordedAt,
                sr.value        AS value,
                sc.channel_name AS channelName,
                sc.unit         AS unit,
                s.sensor_type   AS sensorType,
                s.sensor_id     AS sensorId,
                rs.segment_id   AS segmentId,
                rs.name         AS segmentName,
                rs.risk_level   AS riskLevel
            FROM sensor_reading sr
            JOIN sensor_channel sc ON sr.channel_id = sc.channel_id
            JOIN sensor          s  ON sc.sensor_id  = s.sensor_id
            JOIN railway_segment rs ON s.segment_id  = rs.segment_id
            WHERE rs.segment_id = :segmentId
            ORDER BY sr.recorded_at DESC
            """, 
            countQuery = "SELECT count(*) FROM sensor_reading sr JOIN sensor_channel sc ON sr.channel_id=sc.channel_id JOIN sensor s ON sc.sensor_id=s.sensor_id WHERE s.segment_id = :segmentId",
            nativeQuery = true)
    Page<TelemetryView> findLatestBySegment(@Param("segmentId") String segmentId, Pageable pageable);

    /**
     * Belirli bir zaman aralığındaki okumaları getirir.
     */
    List<SensorReading> findByRecordedAtBetween(java.time.LocalDateTime start, java.time.LocalDateTime end);

    /**
     * Belirli bir kanal için zaman aralığına göre okumaları getirir.
     */
    List<SensorReading> findByChannel_ChannelIdAndRecordedAtBetween(Integer channelId, java.time.LocalDateTime start, java.time.LocalDateTime end);
}
