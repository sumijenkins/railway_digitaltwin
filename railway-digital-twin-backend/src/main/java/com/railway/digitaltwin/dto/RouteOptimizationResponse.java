package com.railway.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RouteOptimizationResponse {
    
    private String startStation;
    private String endStation;
    private List<RoutePathDto> topRoutes;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RoutePathDto {
        private int rank;
        private List<String> segmentIds;
        private List<String> stationPath;
        private double totalDistanceKm;
        private double totalEnergyRisk;
        private int activeAnomaliesCount;
        private double totalCostScore;
    }
}
