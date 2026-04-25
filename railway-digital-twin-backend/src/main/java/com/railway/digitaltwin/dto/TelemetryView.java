package com.railway.digitaltwin.dto;

import java.time.LocalDateTime;

/**
 * Native SQL sorgusu için Spring Data projection arayüzü.
 * SensorReadingRepository.findLatestTelemetry() metodu bu arayüzü döndürür.
 * Kolon alias'ları (AS readingId, AS channelName...) getter isimlerine karşılık gelir.
 */
public interface TelemetryView {
    Long getReadingId();
    LocalDateTime getRecordedAt();
    Double getValue();
    String getChannelName();
    String getUnit();
    String getSensorType();
    Integer getSensorId();
    String getSegmentId();
    String getSegmentName();
    String getRiskLevel();
}
