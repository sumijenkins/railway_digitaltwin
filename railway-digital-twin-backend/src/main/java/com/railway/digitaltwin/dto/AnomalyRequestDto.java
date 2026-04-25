package com.railway.digitaltwin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * POST /api/anomalies endpoint'i için istek gövdesi.
 * Entity yerine DTO kullanarak validation sağlanır.
 */
@Data
public class AnomalyRequestDto {

    @NotBlank(message = "segmentId zorunludur")
    private String segmentId;

    @NotBlank(message = "anomalyType zorunludur")
    private String anomalyType;

    @NotNull(message = "severity zorunludur")
    @Pattern(regexp = "HIGH|MEDIUM|LOW", message = "severity yalnızca HIGH, MEDIUM veya LOW olabilir")
    private String severity;
}
