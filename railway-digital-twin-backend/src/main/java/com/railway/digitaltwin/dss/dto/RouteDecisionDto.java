package com.railway.digitaltwin.dss.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RouteDecisionDto {
    private String selectedRoute;
    private Double estimatedEnergy;
    private Double estimatedRisk;
    private String explanation;
}