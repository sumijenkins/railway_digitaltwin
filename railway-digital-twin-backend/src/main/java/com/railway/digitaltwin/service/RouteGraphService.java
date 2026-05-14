package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.RouteOptimizationRequest;
import com.railway.digitaltwin.dto.RouteOptimizationResponse;
import com.railway.digitaltwin.entity.Anomaly;
import com.railway.digitaltwin.entity.EnergyRisk;
import com.railway.digitaltwin.entity.RailwaySegment;
import com.railway.digitaltwin.repository.AnomalyRepository;
import com.railway.digitaltwin.repository.EnergyRiskRepository;
import com.railway.digitaltwin.repository.RailwaySegmentRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RouteGraphService {

    private static final Logger logger = LoggerFactory.getLogger(RouteGraphService.class);

    private final RailwaySegmentRepository segmentRepository;
    private final AnomalyRepository anomalyRepository;
    private final EnergyRiskRepository energyRiskRepository;

    public RouteOptimizationResponse optimizeRoute(RouteOptimizationRequest request) {
        logger.info("Optimizing route from {} to {}", request.getStartStation(), request.getEndStation());

        List<RailwaySegment> allSegments = segmentRepository.findAll();

        // Caching latest metrics for fast cost calculation
        Map<String, Double> segmentEnergyRiskMap = new HashMap<>();
        Map<String, Integer> segmentAnomalyCountMap = new HashMap<>();

        for (RailwaySegment segment : allSegments) {
            // Fetch latest energy risk
            List<EnergyRisk> risks = energyRiskRepository.findBySegment_SegmentId(
                    segment.getSegmentId(), PageRequest.of(0, 1)).getContent();
            segmentEnergyRiskMap.put(segment.getSegmentId(), risks.isEmpty() ? 0.0 : risks.get(0).getRiskScore());

            // Fetch active anomalies count (e.g., all anomalies for the segment)
            // In a real app we'd filter by 'active' status or last 24h, we just take the
            // count of recent ones here
            List<Anomaly> anomalies = anomalyRepository
                    .findBySegment_SegmentIdOrderByDetectedTimeDesc(segment.getSegmentId());
            segmentAnomalyCountMap.put(segment.getSegmentId(), anomalies.size());
        }

        // Build adjacency list (Graph)
        // Since segments might be bidirectional in reality, we add both directions.
        Map<String, List<RailwaySegment>> graph = new HashMap<>();
        for (RailwaySegment segment : allSegments) {
            String[] stations = segment.getName().split(" - ");

            if (stations.length != 2) {
                continue;
            }

            String startStation = stations[0].trim();
            String endStation = stations[1].trim();

            RailwaySegment forwardSegment = RailwaySegment.builder()
                    .segmentId(segment.getSegmentId())
                    .name(segment.getName())
                    .lengthKm(segment.getLengthKm())
                    .riskLevel(segment.getRiskLevel())
                    .startStation(startStation)
                    .endStation(endStation)
                    .build();

            graph.computeIfAbsent(startStation, k -> new ArrayList<>()).add(forwardSegment);

            RailwaySegment reverseSegment = RailwaySegment.builder()
                    .segmentId(segment.getSegmentId())
                    .name(segment.getName())
                    .lengthKm(segment.getLengthKm())
                    .riskLevel(segment.getRiskLevel())
                    .startStation(endStation)
                    .endStation(startStation)
                    .build();

            graph.computeIfAbsent(endStation, k -> new ArrayList<>()).add(reverseSegment);
        }

        List<RouteOptimizationResponse.RoutePathDto> allPaths = new ArrayList<>();
        findAllPaths(
                request.getStartStation(),
                request.getEndStation(),
                graph,
                new HashSet<>(),
                new ArrayList<>(),
                new ArrayList<>(),
                allPaths,
                segmentEnergyRiskMap,
                segmentAnomalyCountMap,
                request);

        // Sort by cost ascending
        allPaths.sort(Comparator.comparingDouble(RouteOptimizationResponse.RoutePathDto::getTotalCostScore));

        // Take top 3 and assign ranks
        List<RouteOptimizationResponse.RoutePathDto> topRoutes = allPaths.stream()
                .limit(3)
                .collect(Collectors.toList());

        for (int i = 0; i < topRoutes.size(); i++) {
            topRoutes.get(i).setRank(i + 1);
        }

        return RouteOptimizationResponse.builder()
                .startStation(request.getStartStation())
                .endStation(request.getEndStation())
                .topRoutes(topRoutes)
                .build();
    }

    private void findAllPaths(
            String currentStation,
            String targetStation,
            Map<String, List<RailwaySegment>> graph,
            Set<String> visitedStations,
            List<String> currentStationPath,
            List<String> currentSegmentIds,
            List<RouteOptimizationResponse.RoutePathDto> allPaths,
            Map<String, Double> energyRiskMap,
            Map<String, Integer> anomalyCountMap,
            RouteOptimizationRequest request) {
        visitedStations.add(currentStation);
        currentStationPath.add(currentStation);

        if (currentStation.equals(targetStation)) {
            // Reached destination, calculate cost and save path
            allPaths.add(calculatePathCost(currentStationPath, currentSegmentIds, graph, energyRiskMap, anomalyCountMap,
                    request));
        } else {
            List<RailwaySegment> neighbors = graph.getOrDefault(currentStation, new ArrayList<>());
            for (RailwaySegment edge : neighbors) {
                if (!visitedStations.contains(edge.getEndStation())) {
                    currentSegmentIds.add(edge.getSegmentId());
                    findAllPaths(edge.getEndStation(), targetStation, graph, visitedStations, currentStationPath,
                            currentSegmentIds, allPaths, energyRiskMap, anomalyCountMap, request);
                    currentSegmentIds.remove(currentSegmentIds.size() - 1); // backtrack
                }
            }
        }

        currentStationPath.remove(currentStationPath.size() - 1); // backtrack
        visitedStations.remove(currentStation); // backtrack
    }

    private RouteOptimizationResponse.RoutePathDto calculatePathCost(
            List<String> stationPath,
            List<String> segmentIds,
            Map<String, List<RailwaySegment>> graph,
            Map<String, Double> energyRiskMap,
            Map<String, Integer> anomalyCountMap,
            RouteOptimizationRequest request) {
        double totalDistance = 0;
        double totalEnergyRisk = 0;
        int totalAnomalies = 0;

        for (String segmentId : segmentIds) {
            // Find length of segment
            // We just need any edge with this segmentId
            double length = 0;
            for (List<RailwaySegment> edges : graph.values()) {
                Optional<RailwaySegment> seg = edges.stream().filter(e -> e.getSegmentId().equals(segmentId))
                        .findFirst();
                if (seg.isPresent()) {
                    length = seg.get().getLengthKm();
                    break;
                }
            }

            totalDistance += length;
            totalEnergyRisk += energyRiskMap.getOrDefault(segmentId, 0.0);
            totalAnomalies += anomalyCountMap.getOrDefault(segmentId, 0);
        }

        // Multi-criteria cost formula (simple linear combination for demonstration)
        // Normalize factors approximately (e.g. max distance ~ 500km, risk ~ 1.0,
        // anomalies ~ 10)
        double normalizedDistance = totalDistance / 500.0;
        double normalizedEnergyRisk = totalEnergyRisk / Math.max(1.0, segmentIds.size()); // avg risk per segment
        double normalizedAnomalies = totalAnomalies / 10.0;

        double totalCostScore = (request.getWeightDistance() * normalizedDistance) +
                (request.getWeightEnergy() * normalizedEnergyRisk) +
                (request.getWeightRisk() * normalizedAnomalies);

        double averageSpeedKmh = 70.0;
        double estimatedTimeHours = totalDistance / averageSpeedKmh;

        double totalEnergyScore = totalDistance * 0.85 + totalEnergyRisk * 25.0;

        String riskLevel;
        if (totalAnomalies > 0 || normalizedEnergyRisk >= 0.70) {
            riskLevel = "HIGH";
        } else if (normalizedEnergyRisk >= 0.40) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        String decisionReason =
                "Bu rota; mesafe, enerji-risk skoru ve aktif anomali sayısı birlikte değerlendirilerek hesaplanmıştır. "
                        + "Toplam mesafe " + round(totalDistance)
                        + " km, tahmini süre " + round(estimatedTimeHours)
                        + " saat, enerji skoru " + round(totalEnergyScore)
                        + " ve risk seviyesi " + riskLevel + " olarak hesaplanmıştır.";

        return RouteOptimizationResponse.RoutePathDto.builder()
                .segmentIds(new ArrayList<>(segmentIds))
                .stationPath(new ArrayList<>(stationPath))
                .totalDistanceKm(round(totalDistance))
                .totalEnergyRisk(round(totalEnergyRisk))
                .activeAnomaliesCount(totalAnomalies)
                .totalCostScore(round(totalCostScore))
                .estimatedTimeHours(round(estimatedTimeHours))
                .totalEnergyScore(round(totalEnergyScore))
                .riskLevel(riskLevel)
                .decisionReason(decisionReason)
                .build();
            }

            private double round(double value) {
                return Math.round(value * 100.0) / 100.0;
            }
}
