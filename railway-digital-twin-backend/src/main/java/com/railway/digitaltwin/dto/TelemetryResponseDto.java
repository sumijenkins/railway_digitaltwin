package com.railway.digitaltwin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * GET /api/telemetry endpoint'inin döndürdüğü flat veri nesnesi.
 * TelemetryView projection'dan dönüştürülür.
 */
@Data
@Builder
public class TelemetryResponseDto {
    private Long readingId;
    private LocalDateTime recordedAt;
    private Double value;
    private String channelName;
    private String unit;
    private String sensorType;
    private Integer sensorId;
    private String segmentId;
    private String segmentName;
    private String riskLevel;
}
