package com.railway.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScenarioResponseDto {
    private Double simulatedRul;
    private Boolean simulatedAnomaly;
    private String riskLevel;
    private String explanation;
}