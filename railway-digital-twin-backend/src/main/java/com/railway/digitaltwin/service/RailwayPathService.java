package com.railway.digitaltwin.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.*;

@Service
public class RailwayPathService {

    // segmentId -> path coordinates
    private final Map<String, List<double[]>> pathMap = new HashMap<>();

    @PostConstruct
    public void init() {
        try {
            ObjectMapper mapper = new ObjectMapper();

            InputStream is = getClass().getResourceAsStream("/data/railway.geojson");
            JsonNode root = mapper.readTree(is);

            for (JsonNode feature : root.get("features")) {

                String segmentId = feature.get("properties").get("segmentId").asText();
                JsonNode coords = feature.get("geometry").get("coordinates");

                List<double[]> path = new ArrayList<>();

                for (JsonNode c : coords) {
                    double lon = c.get(0).asDouble();
                    double lat = c.get(1).asDouble();
                    path.add(new double[] { lat, lon });
                }

                pathMap.put(segmentId, path);
            }

        } catch (Exception e) {
            throw new RuntimeException("Railway path load failed", e);
        }
    }

    public List<double[]> getPath(String segmentId) {
        return pathMap.get(segmentId);
    }
}