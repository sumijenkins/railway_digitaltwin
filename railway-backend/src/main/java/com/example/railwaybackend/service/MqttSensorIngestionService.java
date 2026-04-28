package com.example.railwaybackend.service;

import com.example.railwaybackend.dto.MqttSensorPayload;
import com.example.railwaybackend.model.SensorReading;
import com.example.railwaybackend.repository.SensorReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class MqttSensorIngestionService {

    @Autowired
    private SensorReadingRepository repository;

    public void processSensorData(MqttSensorPayload payload) {
        SensorReading reading = new SensorReading();
        reading.setSegmentId(payload.getSegmentId());
        reading.setSensorType(payload.getSensorType());
        reading.setTimestamp(LocalDateTime.parse(payload.getTimestamp(), DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        reading.setTemperature(payload.getTemperature());
        reading.setVibration(payload.getVibration());
        reading.setTilt(payload.getTilt());

        repository.save(reading);
    }
}