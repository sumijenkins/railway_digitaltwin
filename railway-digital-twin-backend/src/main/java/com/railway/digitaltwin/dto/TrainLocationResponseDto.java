package com.railway.digitaltwin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * GET /api/trains/locations endpoint'inin döndürdüğü DTO.
 */
@Data
@Builder
public class TrainLocationResponseDto {
    private Integer trainId;
    private Double latitude;
    private Double longitude;
    private LocalDateTime lastUpdate;
    // Segment bilgisi (flat)
    private String segmentId;
    private String segmentName;
    private String segmentRiskLevel;
}
