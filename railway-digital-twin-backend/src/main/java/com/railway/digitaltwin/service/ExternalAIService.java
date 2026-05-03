package com.railway.digitaltwin.service;

import com.railway.digitaltwin.entity.SensorFeature;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class ExternalAIService {

    private final RestTemplate restTemplate = new RestTemplate();

    public Map<String, Object> detectAnomaly(SensorFeature feature) {

        String url = "http://localhost:5000/anomaly";

        Map<String, Object> request = new HashMap<>();
        request.put("rms", feature.getRms());
        request.put("peakToPeak", feature.getPeakToPeak());
        request.put("fftEnergy", feature.getFftEnergy());
        request.put("slopeGradient", feature.getSlopeGradient());
        request.put("snr", feature.getSnr());

        return restTemplate.postForObject(url, request, Map.class);
    }
}