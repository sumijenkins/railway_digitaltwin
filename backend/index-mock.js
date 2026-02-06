const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Mock telemetry data generator
function generateMockTelemetry() {
    const telemetryData = [];
    const now = new Date();

    // Generate 100 mock telemetry entries
    for (let i = 0; i < 100; i++) {
        const timestamp = new Date(now.getTime() - (i * 3000)); // 3 seconds apart
        const segmentId = Math.floor(Math.random() * 5) + 1; // Segments 1-5

        telemetryData.push({
            id: i + 1,
            segment_id: segmentId,
            timestamp: timestamp.toISOString(),
            ray_temperature: 25 + Math.random() * 20, // 25-45°C
            train_temperature: 20 + Math.random() * 15, // 20-35°C
            ray_vibration_x: 0.5 + Math.random() * 2.5, // 0.5-3.0 Hz
            ray_vibration_y: 0.5 + Math.random() * 2.5,
            ray_vibration_z: 0.5 + Math.random() * 2.5,
            train_vibration_x: 0.3 + Math.random() * 2.0,
            train_vibration_y: 0.3 + Math.random() * 2.0,
            train_vibration_z: 0.3 + Math.random() * 2.0,
            rail_slope: -3 + Math.random() * 6, // -3° to +3°
            train_speed: 60 + Math.random() * 30, // 60-90 km/h
            train_weight: 300 + Math.random() * 400, // 300-700 tons
            ambient_temperature: 15 + Math.random() * 20 // 15-35°C
        });
    }

    return telemetryData;
}

// In-memory data store
let telemetryStore = generateMockTelemetry();

// Periodically refresh data to simulate real-time updates
setInterval(() => {
    const latest = telemetryStore[0];
    const newEntry = {
        id: latest.id + 1,
        segment_id: Math.floor(Math.random() * 5) + 1,
        timestamp: new Date().toISOString(),
        ray_temperature: 25 + Math.random() * 20,
        train_temperature: 20 + Math.random() * 15,
        ray_vibration_x: 0.5 + Math.random() * 2.5,
        ray_vibration_y: 0.5 + Math.random() * 2.5,
        ray_vibration_z: 0.5 + Math.random() * 2.5,
        train_vibration_x: 0.3 + Math.random() * 2.0,
        train_vibration_y: 0.3 + Math.random() * 2.0,
        train_vibration_z: 0.3 + Math.random() * 2.0,
        rail_slope: -3 + Math.random() * 6,
        train_speed: 60 + Math.random() * 30,
        train_weight: 300 + Math.random() * 400,
        ambient_temperature: 15 + Math.random() * 20
    };

    telemetryStore.unshift(newEntry);
    telemetryStore = telemetryStore.slice(0, 100); // Keep only latest 100
}, 3000);

console.log('Mock backend initialized successfully ✓');
console.log('Simulating real-time telemetry data without database');

// GET: All telemetry data
app.get('/api/telemetry', async (req, res) => {
    try {
        res.json(telemetryStore);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST: Insert new telemetry (From IoT sensors or simulation)
app.post('/api/telemetry', async (req, res) => {
    const {
        segment_id,
        ray_temperature,
        train_temperature,
        ray_vibration_x,
        ray_vibration_y,
        ray_vibration_z,
        train_vibration_x,
        train_vibration_y,
        train_vibration_z,
        rail_slope,
        train_speed,
        train_weight,
        ambient_temperature
    } = req.body;

    try {
        const newEntry = {
            id: telemetryStore[0].id + 1,
            segment_id,
            timestamp: new Date().toISOString(),
            ray_temperature,
            train_temperature,
            ray_vibration_x,
            ray_vibration_y,
            ray_vibration_z,
            train_vibration_x,
            train_vibration_y,
            train_vibration_z,
            rail_slope,
            train_speed,
            train_weight,
            ambient_temperature
        };

        telemetryStore.unshift(newEntry);
        telemetryStore = telemetryStore.slice(0, 100);

        res.status(201).json(newEntry);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Mock Backend Server running on port ${PORT}`);
    console.log(`📊 API Endpoint: http://localhost:${PORT}/api/telemetry`);
});
