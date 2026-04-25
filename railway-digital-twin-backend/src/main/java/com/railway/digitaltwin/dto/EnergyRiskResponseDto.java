package com.railway.digitaltwin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * GET /api/energy-risks endpoint'inin döndürdüğü DTO.
 */
@Data
@Builder
public class EnergyRiskResponseDto {
    private Integer recordId;
    private Double energyConsumption;
    private Double riskScore;
    private LocalDateTime calculatedTime;
    // Segment bilgisi (flat)
    private String segmentId;
    private String segmentName;
    private String segmentRiskLevel;
}
