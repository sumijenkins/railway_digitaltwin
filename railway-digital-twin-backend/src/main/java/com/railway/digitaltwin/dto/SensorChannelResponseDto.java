package com.railway.digitaltwin.dto;

import lombok.Builder;
import lombok.Data;

/**
 * GET /api/sensors/{id}/channels endpoint'inin döndürdüğü DTO.
 */
@Data
@Builder
public class SensorChannelResponseDto {
    private Integer channelId;
    private String channelName;
    private String unit;
    private Integer sensorId;
    private String sensorType;
}
