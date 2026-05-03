package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.MqttSensorPayload;
import com.railway.digitaltwin.dto.NbiotSensorPayload;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NbiotGatewayService {

    private static final Logger logger = LoggerFactory.getLogger(NbiotGatewayService.class);

    private final MqttSensorIngestionService sensorIngestionService;

    public void processNbiotData(NbiotSensorPayload payload) {
        logger.info(
                "NB-IoT packet received. Device IMEI: {}, Gateway: {}, Signal: {} dBm, Segment: {}",
                payload.getDeviceImei(),
                payload.getGatewayId(),
                payload.getSignalStrength(),
                payload.getSegmentId()
        );

        MqttSensorPayload convertedPayload = new MqttSensorPayload(
                payload.getSensorId(),
                payload.getSegmentId(),
                payload.getSensorType(),
                payload.getTimestamp(),
                payload.getSamplingFrequency(),
                payload.getTemperature(),
                payload.getVibration(),
                payload.getTilt(),
                payload.getCrcHash(),
                payload.getDigitalSignature()
        );

        sensorIngestionService.processSensorData(convertedPayload);
    }
}