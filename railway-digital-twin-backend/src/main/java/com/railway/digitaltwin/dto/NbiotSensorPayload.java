package com.railway.digitaltwin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NbiotSensorPayload {

    private String deviceImei;
    private String gatewayId;
    private Integer signalStrength;

    private Integer sensorId;
    private String segmentId;
    private String sensorType;
    private String timestamp;
    private Double samplingFrequency;

    private Double temperature;
    private Double vibrationX;
    private Double vibrationY;
    private Double vibrationZ;
    private Double tilt;

    private String crcHash;
    private String digitalSignature;
}