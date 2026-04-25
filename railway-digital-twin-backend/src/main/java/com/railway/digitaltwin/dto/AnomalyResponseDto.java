package com.railway.digitaltwin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * GET /api/anomalies endpoint'inin döndürdüğü flat DTO.
 * Entity'nin lazy-load ilişkilerini gizler.
 */
@Data
@Builder
public class AnomalyResponseDto {
    private Integer anomalyId;
    private String anomalyType;
    private String severity;
    private LocalDateTime detectedTime;
    private String segmentId;
    private String segmentName;
}
