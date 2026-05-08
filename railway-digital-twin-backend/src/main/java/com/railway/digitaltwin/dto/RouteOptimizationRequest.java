package com.railway.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteOptimizationRequest {
    private String startStation;
    private String endStation;
    
    @Builder.Default
    private Double weightDistance = 0.4;
    
    @Builder.Default
    private Double weightEnergy = 0.3;
    
    @Builder.Default
    private Double weightRisk = 0.3;
}
