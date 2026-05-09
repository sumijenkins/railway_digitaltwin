package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.MqttSensorPayload;
import com.railway.digitaltwin.entity.Sensor;
import com.railway.digitaltwin.entity.SensorChannel;
import com.railway.digitaltwin.entity.SensorReading;
import com.railway.digitaltwin.repository.SensorChannelRepository;
import com.railway.digitaltwin.repository.SensorReadingRepository;
import com.railway.digitaltwin.repository.SensorRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.LinkedHashMap;
import java.util.Map;
import com.railway.digitaltwin.entity.SensorFeature;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MqttSensorIngestionService {

    private static final Logger logger = LoggerFactory.getLogger(MqttSensorIngestionService.class);

    @Value("${mqtt.secret.key:railway-digital-twin-secret}")
    private String secretKey;

    private final SensorRepository sensorRepository;
    private final SensorChannelRepository sensorChannelRepository;
    private final SensorReadingRepository sensorReadingRepository;
    private final AnomalyService anomalyService;
    private final DataPreprocessingService dataPreprocessingService;

    private final AIAnomalyDetectionService aiAnomalyDetectionService;
    private final AIRulPredictionService aiRulPredictionService;
    private final AIXaiExplanationService aiXaiExplanationService;

    public void processSensorData(MqttSensorPayload payload) {
        try {
            if (!isValidPayload(payload)) {
                logger.warn("Invalid MQTT payload. Missing required metadata or security fields.");
                return;
            }

            //if (!verifyDigitalSignature(payload)) {
            //    logger.warn("MQTT payload signature verification failed for segment: {}", payload.getSegmentId());
            //    return;
            //}

            String segmentId = payload.getSegmentId();
            String sensorType = payload.getSensorType();

            logger.info("Processing MQTT sensor data. Segment: {}, Sensor Type: {}", segmentId, sensorType);

            Optional<Sensor> sensorOpt = sensorRepository.findBySegment_SegmentIdAndSensorType(segmentId, sensorType);

            if (sensorOpt.isEmpty()) {
                logger.warn("No sensor found for segmentId: {}, sensorType: {}", segmentId, sensorType);
                return;
            }

            Sensor sensor = sensorOpt.get();

            LocalDateTime recordedAt = LocalDateTime.parse(
                    payload.getTimestamp(),
                    DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            saveReading(sensor.getSensorId(), "ray_temperature", payload.getTemperature(), recordedAt);
            saveReading(sensor.getSensorId(), "ray_vibration_x", payload.getVibrationX(), recordedAt);
            saveReading(sensor.getSensorId(), "ray_vibration_y", payload.getVibrationY(), recordedAt);
            saveReading(sensor.getSensorId(), "ray_vibration_z", payload.getVibrationZ(), recordedAt);
            saveReading(sensor.getSensorId(), "rail_slope", payload.getTilt(), recordedAt);

            SensorFeature feature = dataPreprocessingService.processAndSaveFeatures(
                    segmentId,
                    sensor.getSensorId(),
                    recordedAt,
                    payload.getTemperature(),
                    payload.getVibrationX(),
                    payload.getVibrationY(),
                    payload.getVibrationZ(),
                    payload.getTilt());

            // AI anomaly detection
            aiAnomalyDetectionService.detectAnomaly(feature);

    // RUL prediction
    double remainingLife = aiRulPredictionService.estimateRemainingLife(feature);
    logger.info("Remaining useful life for segment {}: {} days",
            segmentId,
            remainingLife);
    
            logger.info("MQTT sensor data processed successfully for sensorId: {}", sensor.getSensorId());

        } catch (Exception e) {
            logger.error("Error processing MQTT sensor data: {}", e.getMessage(), e);
        }
    }

    private void saveReading(Integer sensorId, String channelName, Double value, LocalDateTime recordedAt) {
        Optional<SensorChannel> channelOpt = sensorChannelRepository.findBySensor_SensorIdAndChannelName(sensorId,
                channelName);

        if (channelOpt.isEmpty()) {
            logger.warn("Channel not found: {} for sensor: {}", channelName, sensorId);
            return;
        }

        SensorChannel channel = channelOpt.get();

        SensorReading reading = SensorReading.builder()
                .channel(channel)
                .value(value)
                .recordedAt(recordedAt)
                .build();

        sensorReadingRepository.save(reading);

        Sensor sensor = sensorRepository.findById(sensorId).orElse(null);

        if (sensor == null || sensor.getSegment() == null) {
            logger.warn("Sensor or segment not found for sensorId: {}", sensorId);
            return;
        }

        String segmentId = sensor.getSegment().getSegmentId();

        anomalyService.detectAndSave(
                segmentId,
                channelName,
                value,
                recordedAt);

        logger.debug("Saved sensor reading. Channel: {}, Value: {}", channelName, value);
    }

    private boolean isValidPayload(MqttSensorPayload payload) {
        return payload != null
                && payload.getSensorId() != null
                && payload.getSegmentId() != null
                && payload.getSensorType() != null
                && payload.getTimestamp() != null
                && payload.getSamplingFrequency() != null
                && payload.getTemperature() != null
                && payload.getVibrationX() != null
                && payload.getVibrationY() != null
                && payload.getVibrationZ() != null
                && payload.getTilt() != null
                && payload.getCrcHash() != null
                && payload.getDigitalSignature() != null;
    }

    private boolean verifyDigitalSignature(MqttSensorPayload payload) {
        try {
            String expectedHash = calculateExpectedHash(payload);

            if (!expectedHash.equals(payload.getCrcHash())) {
                logger.warn("CRC/hash mismatch. Expected: {}, Received: {}", expectedHash, payload.getCrcHash());
                return false;
            }

            String expectedSignature = calculateHmacSignature(expectedHash);

            return expectedSignature.equals(payload.getDigitalSignature());

        } catch (Exception e) {
            logger.error("Error during digital signature verification: {}", e.getMessage(), e);
            return false;
        }
    }

    private String calculateExpectedHash(MqttSensorPayload payload) throws Exception {
        ObjectMapper mapper = new ObjectMapper();

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("samplingFrequency", payload.getSamplingFrequency());
        map.put("segmentId", payload.getSegmentId());
        map.put("sensorId", payload.getSensorId());
        map.put("sensorType", payload.getSensorType());
        map.put("temperature", payload.getTemperature());
        map.put("tilt", payload.getTilt());
        map.put("timestamp", payload.getTimestamp());
        map.put("vibrationX", payload.getVibrationX());
        map.put("vibrationY", payload.getVibrationY());
        map.put("vibrationZ", payload.getVibrationZ());

        String jsonPayload = mapper.writeValueAsString(map);

        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest(jsonPayload.getBytes(StandardCharsets.UTF_8));

        return HexFormat.of().formatHex(hashBytes);
    }

    private String calculateHmacSignature(String crcHash) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(
                secretKey.getBytes(StandardCharsets.UTF_8),
                "HmacSHA256");

        hmac.init(secretKeySpec);

        byte[] signatureBytes = hmac.doFinal(crcHash.getBytes(StandardCharsets.UTF_8));

        return HexFormat.of().formatHex(signatureBytes);
    }
}