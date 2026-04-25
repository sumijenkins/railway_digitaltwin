package com.railway.digitaltwin.dto;

import lombok.Builder;
import lombok.Data;

/**
 * GET /api/segments endpoint'inin döndürdüğü DTO.
 */
@Data
@Builder
public class SegmentResponseDto {
    private String segmentId;
    private String name;
    private Double lengthKm;
    private String riskLevel;
}
