const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL Connection Pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'digitaltwin',
    password: 'Postgres26',
    port: 5432,
});

// Test DB Connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Database connected successfully at:', res.rows[0].now);
});

// GET: All telemetry data
app.get('/api/telemetry', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM railway_telemetry ORDER BY timestamp DESC LIMIT 100');
        res.json(result.rows);
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
        const query = `
      INSERT INTO railway_telemetry (
        segment_id, ray_temperature, train_temperature, 
        ray_vibration_x, ray_vibration_y, ray_vibration_z,
        train_vibration_x, train_vibration_y, train_vibration_z,
        rail_slope, train_speed, train_weight, ambient_temperature
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
        const values = [
            segment_id, ray_temperature, train_temperature,
            ray_vibration_x, ray_vibration_y, ray_vibration_z,
            train_vibration_x, train_vibration_y, train_vibration_z,
            rail_slope, train_speed, train_weight, ambient_temperature
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
