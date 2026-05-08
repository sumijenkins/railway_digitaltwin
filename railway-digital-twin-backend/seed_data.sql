-- ============================================================
-- Railway Digital Twin — Seed Data (İzmir–Bandırma Hattı)
-- pgAdmin veya psql'den çalıştırın: \i seed_data.sql
-- ============================================================

-- ① RAILWAY SEGMENTS (6 segment, gerçek hat verileri)
-- ============================================================
INSERT INTO railway_segment (segment_id, name, length_km, risk_level, start_station, end_station) VALUES
  ('S1', 'Izmir - Manisa',         36.0, 'LOW',    'Izmir',     'Manisa'),
  ('S2', 'Manisa - Akhisar',       52.0, 'LOW',    'Manisa',    'Akhisar'),
  ('S3', 'Akhisar - Soma',         45.0, 'MEDIUM', 'Akhisar',   'Soma'),
  ('S4', 'Soma - Balikesir',       88.0, 'LOW',    'Soma',      'Balikesir'),
  ('S5', 'Balikesir - Susurluk',   45.0, 'MEDIUM', 'Balikesir', 'Susurluk'),
  ('S6', 'Susurluk - Bandirma',    42.0, 'LOW',    'Susurluk',  'Bandirma')
ON CONFLICT (segment_id) DO NOTHING;


-- ② SENSORS (her segment için 2 sensör: ray + tren)
-- ============================================================
INSERT INTO sensor (sensor_type, segment_id, status) VALUES
  ('RAY_SENSOR',   'S1', 'ACTIVE'), -- sensor_id: 1
  ('TRAIN_SENSOR', 'S1', 'ACTIVE'), -- sensor_id: 2
  ('RAY_SENSOR',   'S2', 'ACTIVE'), -- sensor_id: 3
  ('TRAIN_SENSOR', 'S2', 'ACTIVE'), -- sensor_id: 4
  ('RAY_SENSOR',   'S3', 'ACTIVE'), -- sensor_id: 5
  ('TRAIN_SENSOR', 'S3', 'ACTIVE'), -- sensor_id: 6
  ('RAY_SENSOR',   'S4', 'ACTIVE'), -- sensor_id: 7
  ('TRAIN_SENSOR', 'S4', 'ACTIVE'), -- sensor_id: 8
  ('RAY_SENSOR',   'S5', 'ACTIVE'), -- sensor_id: 9
  ('TRAIN_SENSOR', 'S5', 'ACTIVE'), -- sensor_id: 10
  ('RAY_SENSOR',   'S6', 'ACTIVE'), -- sensor_id: 11
  ('TRAIN_SENSOR', 'S6', 'ACTIVE'); -- sensor_id: 12


-- ③ SENSOR CHANNELS
-- RAY_SENSOR kanalları: ray_temperature, ray_vibration_x, rail_slope
-- TRAIN_SENSOR kanalları: train_temperature, train_speed, train_vibration_x
-- NOT: channel_name değerleri backend'in beklediği değerlerdir (App.tsx ile eşleşmeli)
-- ============================================================
INSERT INTO sensor_channel (sensor_id, channel_name, unit)
SELECT s.sensor_id, ch.channel_name, ch.unit
FROM sensor s
CROSS JOIN (
    VALUES
      ('ray_temperature',  '°C'),
      ('ray_vibration_x',  'Hz'),
      ('rail_slope',       '°')
) AS ch(channel_name, unit)
WHERE s.sensor_type = 'RAY_SENSOR';

INSERT INTO sensor_channel (sensor_id, channel_name, unit)
SELECT s.sensor_id, ch.channel_name, ch.unit
FROM sensor s
CROSS JOIN (
    VALUES
      ('train_temperature', '°C'),
      ('train_speed',       'km/h'),
      ('train_vibration_x', 'Hz')
) AS ch(channel_name, unit)
WHERE s.sensor_type = 'TRAIN_SENSOR';


-- ④ SENSOR READINGS (her kanal için 20 örnek ölçüm)
-- generate_series ile son 1 saatlik veri oluşturulur
-- ============================================================
INSERT INTO sensor_reading (channel_id, recorded_at, value)
SELECT
    ch.channel_id,
    NOW() - (gs.n * INTERVAL '3 minutes'),
    CASE ch.channel_name
        WHEN 'ray_temperature'   THEN 25.0  + random() * 20.0   -- 25–45°C
        WHEN 'ray_vibration_x'   THEN 0.5   + random() * 3.5    -- 0.5–4 Hz
        WHEN 'rail_slope'        THEN -2.0  + random() * 4.0    -- -2° ile +2°
        WHEN 'train_temperature' THEN 30.0  + random() * 15.0   -- 30–45°C
        WHEN 'train_speed'       THEN 60.0  + random() * 40.0   -- 60–100 km/h
        WHEN 'train_vibration_x' THEN 1.0   + random() * 2.5    -- 1–3.5 Hz
        ELSE 0.0
    END
FROM sensor_channel ch
CROSS JOIN generate_series(1, 20) AS gs(n);


-- ⑤ LOCOMOTIVE
-- ============================================================
INSERT INTO locomotive (model, power_kw, max_speed, status) VALUES
  ('TCDD DE33000', 2200, 120, 'ACTIVE'),
  ('TCDD DE11000', 1500, 100, 'ACTIVE')
ON CONFLICT DO NOTHING;


-- ⑥ ROUTE
-- ============================================================
INSERT INTO route (start_point, end_point, total_energy, total_risk, is_optimal, segment_path, route_rank) VALUES
  ('Izmir', 'Bandirma', 850.5, 0.15, true, 'S1,S2,S3,S4,S5,S6', 1),
  ('Izmir', 'Soma',     420.0, 0.20, false, 'S1,S2,S3', 2);


-- ⑦ TRAIN
-- ============================================================
INSERT INTO train (locomotive_id, route_id, wagon_count, total_weight, current_speed)
VALUES
  (1, 1, 8, 450.0, 85.0),
  (2, 2, 6, 320.0, 72.0);


-- ⑧ TRAIN LOCATION
-- ============================================================
INSERT INTO train_location (train_id, segment_id, latitude, longitude, last_update)
VALUES
  (1, 'S2', 38.6191, 27.4289, NOW()),
  (2, 'S3', 38.9208, 27.8428, NOW());


-- ⑨ ANOMALY (örnek kayıtlar)
-- ============================================================
INSERT INTO anomaly (segment_id, anomaly_type, severity, detected_time) VALUES
  ('S3', 'HIGH_TEMP',      'HIGH',   NOW() - INTERVAL '2 hours'),
  ('S5', 'HIGH_VIBRATION', 'MEDIUM', NOW() - INTERVAL '45 minutes'),
  ('S2', 'SPEED_EXCESS',   'LOW',    NOW() - INTERVAL '15 minutes');


-- ⑩ ENERGY RISK
-- ============================================================
INSERT INTO energy_risk (segment_id, energy_consumption, risk_score, calculated_time) VALUES
  ('S1', 120.5, 0.12, NOW() - INTERVAL '1 hour'),
  ('S2', 185.2, 0.18, NOW() - INTERVAL '1 hour'),
  ('S3', 160.8, 0.28, NOW() - INTERVAL '1 hour'),
  ('S4', 290.0, 0.15, NOW() - INTERVAL '1 hour'),
  ('S5', 155.3, 0.35, NOW() - INTERVAL '1 hour'),
  ('S6', 140.1, 0.10, NOW() - INTERVAL '1 hour');


-- ============================================================
-- Doğrulama sorguları (çalıştırdıktan sonra kontrol edin)
-- ============================================================
SELECT 'Segments'        AS tablo, COUNT(*) AS adet FROM railway_segment
UNION ALL
SELECT 'Sensors',          COUNT(*) FROM sensor
UNION ALL
SELECT 'Channels',         COUNT(*) FROM sensor_channel
UNION ALL
SELECT 'Readings',         COUNT(*) FROM sensor_reading
UNION ALL
SELECT 'Anomalies',        COUNT(*) FROM anomaly
UNION ALL
SELECT 'EnergyRisk',       COUNT(*) FROM energy_risk
UNION ALL
SELECT 'Locomotives',      COUNT(*) FROM locomotive
UNION ALL
SELECT 'Routes',           COUNT(*) FROM route
UNION ALL
SELECT 'Trains',           COUNT(*) FROM train
UNION ALL
SELECT 'TrainLocations',   COUNT(*) FROM train_location;
