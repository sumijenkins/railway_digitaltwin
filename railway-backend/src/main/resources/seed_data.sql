-- Seed data for sensors and channels
-- Assuming railway_segment table exists if needed

INSERT INTO sensor (sensor_id, sensor_type) VALUES
('S1', 'RAY_SENSOR'),
('S2', 'RAY_SENSOR'),
('S3', 'RAY_SENSOR'),
('S4', 'RAY_SENSOR'),
('S5', 'RAY_SENSOR'),
('S6', 'RAY_SENSOR');

INSERT INTO sensor_channel (sensor_id, channel_name, unit) VALUES
('S1', 'ray_temperature', '°C'),
('S1', 'ray_vibration_x', 'm/s²'),
('S1', 'rail_slope', '°'),
('S2', 'ray_temperature', '°C'),
('S2', 'ray_vibration_x', 'm/s²'),
('S2', 'rail_slope', '°'),
('S3', 'ray_temperature', '°C'),
('S3', 'ray_vibration_x', 'm/s²'),
('S3', 'rail_slope', '°'),
('S4', 'ray_temperature', '°C'),
('S4', 'ray_vibration_x', 'm/s²'),
('S4', 'rail_slope', '°'),
('S5', 'ray_temperature', '°C'),
('S5', 'ray_vibration_x', 'm/s²'),
('S5', 'rail_slope', '°'),
('S6', 'ray_temperature', '°C'),
('S6', 'ray_vibration_x', 'm/s²'),
('S6', 'rail_slope', '°');