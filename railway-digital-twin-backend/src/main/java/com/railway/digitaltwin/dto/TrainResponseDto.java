package com.railway.digitaltwin.dto;

import lombok.Builder;
import lombok.Data;

/**
 * GET /api/trains endpoint'inin döndürdüğü DTO.
 */
@Data
@Builder
public class TrainResponseDto {
    private Integer trainId;
    private Integer wagonCount;
    private Double totalWeight;
    private Double currentSpeed;
    // Locomotive bilgileri (flat)
    private Integer locomotiveId;
    private String locomotiveModel;
    private Integer locomotivePowerKw;
    // Route bilgileri (flat)
    private Integer routeId;
    private String routeStartPoint;
    private String routeEndPoint;
}
