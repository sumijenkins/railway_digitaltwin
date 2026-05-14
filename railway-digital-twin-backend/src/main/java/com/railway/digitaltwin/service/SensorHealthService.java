package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.SensorHealthDto;
import com.railway.digitaltwin.repository.SensorHealthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SensorHealthService {

    private final SensorHealthRepository sensorHealthRepository;

    public List<SensorHealthDto> getSensorHealth() {
        LocalDateTime since = LocalDateTime.now().minusMinutes(1);

        return List.of(
                buildHealth("Sıcaklık Sensörleri", "temperature", since),
                buildHealth("Titreşim Sensörleri", "vibration", since),
                buildHealth("Eğim Sensörleri", "slope", since),
                buildHealth("Hız Sensörleri", "speed", since)
        );
    }

    private SensorHealthDto buildHealth(String label, String keyword, LocalDateTime since) {
        Long total = sensorHealthRepository.countTotalChannelsByKeyword(keyword);
        Long active = sensorHealthRepository.countActiveChannelsByKeyword(keyword, since);

        String color = determineColor(active, total);
        String status = active + "/" + total + " Aktif";

        return SensorHealthDto.builder()
                .label(label)
                .activeCount(active)
                .totalCount(total)
                .status(status)
                .color(color)
                .build();
    }

    private String determineColor(Long active, Long total) {
        if (total == null || total == 0) {
            return "red";
        }

        double ratio = active.doubleValue() / total.doubleValue();

        if (ratio >= 0.9) {
            return "green";
        }

        if (ratio >= 0.7) {
            return "yellow";
        }

        return "red";
    }
}