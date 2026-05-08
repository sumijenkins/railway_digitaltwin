package com.railway.digitaltwin.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EnergyRiskResponseDto {

    // Eski DB kayıtları için
    private Integer recordId;
    private Double energyConsumption;
    private LocalDateTime calculatedTime;
    private String segmentRiskLevel;

    // Ortak alanlar
    private String segmentId;
    private String segmentName;
    private Double riskScore;

    // Anlık hesaplama için
    private Double temperature;
    private Double vibration;
    private Double tilt;
    private Double energyScore;
    private String riskLevel;
    private String recommendation;
}