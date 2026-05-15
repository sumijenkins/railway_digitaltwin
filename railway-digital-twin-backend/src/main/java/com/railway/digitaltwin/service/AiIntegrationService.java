package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.MqttSensorPayload;
import com.railway.digitaltwin.entity.Sensor;
import com.railway.digitaltwin.entity.SensorChannel;
import com.railway.digitaltwin.entity.SensorFeature;
import com.railway.digitaltwin.entity.SensorReading;
import com.railway.digitaltwin.repository.SensorChannelRepository;
import com.railway.digitaltwin.repository.SensorReadingRepository;
import com.railway.digitaltwin.repository.SensorRepository;
import com.railway.digitaltwin.repository.SensorFeatureRepository;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiIntegrationService {

    private static final Logger logger = LoggerFactory.getLogger(AiIntegrationService.class);

    private final SensorRepository sensorRepository;
    private final SensorChannelRepository sensorChannelRepository;
    private final SensorReadingRepository sensorReadingRepository;
    private final SensorFeatureRepository sensorFeatureRepository;

    private final AnomalyService anomalyService;
    private final DataPreprocessingService dataPreprocessingService;
    private final AIAnomalyDetectionService aiAnomalyDetectionService;
    private final AIRulPredictionService aiRulPredictionService;

    @Async
    @Transactional
    public void processAndSaveAsync(MqttSensorPayload payload) {

        try {
            String segmentId = payload.getSegmentId();
            String sensorType = payload.getSensorType();

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
            saveReading(sensor.getSensorId(), "train_temperature", payload.getTrainTemperature(), recordedAt);
            saveReading(sensor.getSensorId(), "train_speed", payload.getTrainSpeed(), recordedAt);
            saveReading(sensor.getSensorId(), "train_vibration_x", payload.getTrainVibrationX(), recordedAt);

            SensorFeature feature = dataPreprocessingService.processAndSaveFeatures(
                    segmentId,
                    sensor.getSensorId(),
                    recordedAt,
                    payload.getTemperature(),
                    payload.getVibrationX(),
                    payload.getVibrationY(),
                    payload.getVibrationZ(),
                    payload.getTilt());

            aiAnomalyDetectionService.detectAnomaly(feature);

            double remainingLife = aiRulPredictionService.predictRul(feature).getRemainingLifeDays();

            logger.info("RUL for segment {}: {} days", segmentId, remainingLife);

        } catch (Exception e) {
            logger.error("AI processing error: {}", e.getMessage(), e);
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
            return;
        }

        String segmentId = sensor.getSegment().getSegmentId();

        anomalyService.detectAndSave(
                segmentId,
                channelName,
                value,
                recordedAt);
    }
}