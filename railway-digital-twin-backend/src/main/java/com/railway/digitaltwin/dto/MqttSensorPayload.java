package com.railway.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MqttSensorPayload {

    private String sensorId;
    private String segmentId;
    private String sensorType;
    private String timestamp;
    private Integer samplingFrequency;

    private Double temperature;
    private Double vibration;
    private Double tilt;

    private String crcHash;
    private String digitalSignature;
}