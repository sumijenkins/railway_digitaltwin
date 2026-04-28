package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.MqttSensorPayload;
import com.railway.digitaltwin.entity.Sensor;
import com.railway.digitaltwin.entity.SensorChannel;
import com.railway.digitaltwin.entity.SensorReading;
import com.railway.digitaltwin.repository.SensorChannelRepository;
import com.railway.digitaltwin.repository.SensorReadingRepository;
import com.railway.digitaltwin.repository.SensorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;

@Service
public class MqttSensorIngestionService {

    private static final Logger logger = LoggerFactory.getLogger(MqttSensorIngestionService.class);

    @Autowired
    private SensorRepository sensorRepository;

    @Autowired
    private SensorChannelRepository sensorChannelRepository;

    @Autowired
    private SensorReadingRepository sensorReadingRepository;

    public void processSensorData(MqttSensorPayload payload) {
        try {
            String segmentId = payload.getSegmentId();
            String sensorType = payload.getSensorType();

            logger.info("Processing sensor data for segmentId: {}, sensorType: {}", segmentId, sensorType);

            // Find the RAY_SENSOR by segmentId and sensorType
            Optional<Sensor> sensorOpt = sensorRepository.findBySegment_SegmentIdAndSensorType(segmentId, sensorType);
            if (sensorOpt.isEmpty()) {
                logger.warn("No sensor found for segmentId: {}, sensorType: {}", segmentId, sensorType);
                return;
            }
            Sensor sensor = sensorOpt.get();

            // Parse timestamp
            LocalDateTime recordedAt = LocalDateTime.parse(payload.getTimestamp(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            // Map and save readings
            saveReading(sensor.getSensorId(), "ray_temperature", payload.getTemperature(), recordedAt);
            saveReading(sensor.getSensorId(), "ray_vibration_x", payload.getVibration(), recordedAt);
            saveReading(sensor.getSensorId(), "rail_slope", payload.getTilt(), recordedAt);

            logger.info("Successfully processed sensor data for sensorId: {}", sensor.getSensorId());
        } catch (Exception e) {
            logger.error("Error processing sensor data: {}", e.getMessage(), e);
            throw e;
        }
    }

    private void saveReading(Integer sensorId, String channelName, Double value, LocalDateTime recordedAt) {
        try {
            // Find the channel
            Optional<SensorChannel> channelOpt = sensorChannelRepository.findBySensor_SensorIdAndChannelName(sensorId, channelName);
            if (channelOpt.isEmpty()) {
                logger.warn("Channel not found: {} for sensor: {}", channelName, sensorId);
                return;
            }
            SensorChannel channel = channelOpt.get();

            // Create and save reading
            SensorReading reading = SensorReading.builder()
                    .channel(channel)
                    .value(value)
                    .recordedAt(recordedAt)
                    .build();

            sensorReadingRepository.save(reading);
            logger.debug("Saved reading for channel: {}, value: {}", channelName, value);
        } catch (Exception e) {
            logger.error("Error saving reading for channel: {}, sensor: {}", channelName, sensorId, e);
            throw e;
        }
    }
}