-- Database Schema for Railway Digital Twin Telemetry
-- Target DB: PostgreSQL

CREATE TABLE IF NOT EXISTS railway_telemetry (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    segment_id VARCHAR(50) NOT NULL,
    
    -- Temperatures
    ray_temperature FLOAT,      -- Ray (Rail) temperature in °C
    train_temperature FLOAT,    -- Train (Wheel/Axle) temperature in °C
    ambient_temperature FLOAT,  -- Outside ambient temperature in °C
    
    -- Vibrations (Ray/Rail)
    ray_vibration_x FLOAT,
    ray_vibration_y FLOAT,
    ray_vibration_z FLOAT,
    
    -- Vibrations (Train/Vagon)
    train_vibration_x FLOAT,
    train_vibration_y FLOAT,
    train_vibration_z FLOAT,
    
    -- Physical/Operational Matrix
    rail_slope FLOAT,           -- Gradient (Slope) %
    train_speed FLOAT,          -- Instantaneous Speed (km/h)
    train_weight FLOAT          -- Total train load (Tons)
);

-- Indexing for time-series analysis
CREATE INDEX idx_telemetry_timestamp ON railway_telemetry (timestamp DESC);
CREATE INDEX idx_telemetry_segment ON railway_telemetry (segment_id);

-- Sample query to get latest telemetry for all segments
-- SELECT DISTINCT ON (segment_id) * FROM railway_telemetry ORDER BY segment_id, timestamp DESC;
