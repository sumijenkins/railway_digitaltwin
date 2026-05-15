package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.ScenarioRequestDto;
import com.railway.digitaltwin.dto.ScenarioResponseDto;
import com.railway.digitaltwin.entity.SensorFeature;
import com.railway.digitaltwin.repository.SensorFeatureRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class ScenarioService {

    private final SensorFeatureRepository sensorFeatureRepository;
    private final RestTemplate restTemplate;

    @Value("${AI_SERVICE_URL:http://ai-service:5000}")
    private String aiServiceUrl;

    public ScenarioResponseDto simulateScenario(ScenarioRequestDto scenario) {

        if (scenario.getSegmentId() == null || scenario.getSegmentId().isBlank()) {
            return ScenarioResponseDto.builder()
                    .explanation("Geçersiz segmentId")
                    .riskLevel("UNKNOWN")
                    .simulatedAnomaly(false)
                    .build();
        }

        try {
            String url = aiServiceUrl + "/scenario-analyze";

            return restTemplate.postForObject(
                    url,
                    scenario,
                    ScenarioResponseDto.class);

        } catch (Exception e) {
            return ScenarioResponseDto.builder()
                    .explanation("AI servis hatası: " + e.getMessage())
                    .riskLevel("ERROR")
                    .simulatedAnomaly(false)
                    .build();
        }
    }

    public SensorFeature getLatestFeatureForSegment(String segmentId) {
        return sensorFeatureRepository
                .findTopBySegmentIdOrderByRecordedAtDesc(segmentId)
                .orElse(null);
    }
}