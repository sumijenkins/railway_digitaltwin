package com.railway.digitaltwin.dto;

import lombok.Builder;
import lombok.Data;

/**
 * GET /api/sensors endpoint'inin döndürdüğü DTO.
 */
@Data
@Builder
public class SensorResponseDto {
    private Integer sensorId;
    private String sensorType;
    private String status;
    // Segment bilgisi (flat)
    private String segmentId;
    private String segmentName;
}
