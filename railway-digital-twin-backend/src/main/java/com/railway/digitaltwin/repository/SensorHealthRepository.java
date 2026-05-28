package com.railway.digitaltwin.repository;

import com.railway.digitaltwin.entity.SensorChannel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;

public interface SensorHealthRepository extends JpaRepository<SensorChannel, Integer> {

    @Query(value = """
            SELECT COUNT(*)
            FROM sensor_channel sc
            WHERE LOWER(sc.channel_name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            """, nativeQuery = true)
    Long countTotalChannelsByKeyword(String keyword);

    @Query(value = """
            SELECT COUNT(DISTINCT sc.channel_id)
            FROM sensor_channel sc
            JOIN sensor_reading sr ON sr.channel_id = sc.channel_id
            WHERE LOWER(sc.channel_name) LIKE LOWER(CONCAT('%', :keyword, '%'))
              AND sr.recorded_at >= :since
            """, nativeQuery = true)
    Long countActiveChannelsByKeyword(String keyword, LocalDateTime since);
}