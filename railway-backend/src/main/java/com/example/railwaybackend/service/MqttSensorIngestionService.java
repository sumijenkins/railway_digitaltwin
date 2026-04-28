package com.example.railwaybackend.service;

import com.example.railwaybackend.dto.MqttSensorPayload;
import com.example.railwaybackend.model.Sensor;
import com.example.railwaybackend.model.SensorChannel;
import com.example.railwaybackend.model.SensorReading;
import com.example.railwaybackend.repository.SensorChannelRepository;
import com.example.railwaybackend.repository.SensorReadingRepository;
import com.example.railwaybackend.repository.SensorRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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
            String sensorId = payload.getSegmentId();
            logger.info("Processing sensor data for sensorId: {}", sensorId);

            // Find the sensor
            Sensor sensor = sensorRepository.findBySensorId(sensorId)
                    .orElseThrow(() -> new RuntimeException("Sensor not found: " + sensorId));

            // Parse timestamp
            LocalDateTime recordedAt = LocalDateTime.parse(payload.getTimestamp(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);

            // Map and save readings
            saveReading(sensorId, "ray_temperature", payload.getTemperature(), recordedAt);
            saveReading(sensorId, "ray_vibration_x", payload.getVibration(), recordedAt);
            saveReading(sensorId, "rail_slope", payload.getTilt(), recordedAt);

            logger.info("Successfully processed sensor data for sensorId: {}", sensorId);
        } catch (Exception e) {
            logger.error("Error processing sensor data: {}", e.getMessage(), e);
            throw e; // Re-throw to let the handler deal with it
        }
    }

    private void saveReading(String sensorId, String channelName, Double value, LocalDateTime recordedAt) {
        try {
            // Find the channel
            SensorChannel channel = sensorChannelRepository.findBySensor_SensorIdAndChannelName(sensorId, channelName)
                    .orElseThrow(() -> new RuntimeException("Channel not found: " + channelName + " for sensor: " + sensorId));

            // Create and save reading
            SensorReading reading = new SensorReading();
            reading.setChannel(channel);
            reading.setValue(value);
            reading.setRecordedAt(recordedAt);

            sensorReadingRepository.save(reading);
            logger.debug("Saved reading for channel: {}, value: {}", channelName, value);
        } catch (Exception e) {
            logger.error("Error saving reading for channel: {}, sensor: {}", channelName, sensorId, e);
            throw e;
        }
    }
}