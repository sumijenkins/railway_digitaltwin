package com.railway.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MqttSensorPayload {

    private String segmentId;
    private String sensorType;
    private String timestamp;
    private Double temperature;
    private Double vibration;
    private Double tilt;
}