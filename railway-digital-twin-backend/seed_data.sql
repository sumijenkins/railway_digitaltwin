-- ============================================================
-- Railway Digital Twin — Seed Data (İzmir–Bandırma Hattı)
-- Updated: 2026-05-15 (To match Backend DTO & Ingestion Service)
-- ============================================================

-- ① RAILWAY SEGMENTS (6 segment)
-- ============================================================
INSERT INTO railway_segment (segment_id, name, length_km, risk_level, start_station, end_station) VALUES
  ('S1', 'Izmir - Manisa',         36.0, 'LOW',    'Izmir',     'Manisa'),
  ('S2', 'Manisa - Akhisar',       52.0, 'LOW',    'Manisa',    'Akhisar'),
  ('S3', 'Akhisar - Soma',         45.0, 'MEDIUM', 'Akhisar',   'Soma'),
  ('S4', 'Soma - Balikesir',       88.0, 'LOW',    'Soma',      'Balikesir'),
  ('S5', 'Balikesir - Susurluk',   45.0, 'MEDIUM', 'Balikesir', 'Susurluk'),
  ('S6', 'Susurluk - Bandirma',    42.0, 'LOW',    'Susurluk',  'Bandirma'),
  ('S7', 'Susurluk - Bandirma',    42.0, 'LOW',    'Susurluk',  'Bandirma'),
  ('S8', 'Manisa - Usak',          210.0, 'LOW',    'Manisa',    'Usak'),
  ('S9', 'Usak - Afyonkarahisar',  115.0, 'LOW',    'Usak',      'Afyonkarahisar'),
  ('S10', 'Afyon - Eskisehir',     145.0, 'LOW',    'Afyonkarahisar', 'Eskisehir'),
  ('S11', 'Eskisehir - Ankara',    235.0, 'LOW',    'Eskisehir', 'Ankara'),
  ('S12', 'Istanbul - Gebze',      55.0,  'MEDIUM', 'Istanbul',  'Gebze'),
  ('S13', 'Gebze - Izmit',         50.0,  'MEDIUM', 'Gebze',     'Izmit'),
  ('S14', 'Izmit - Arifiye',       42.0,  'LOW',    'Izmit',     'Arifiye'),
  ('S15', 'Arifiye - Bilecik',     95.0,  'LOW',    'Arifiye',   'Bilecik'),
  ('S16', 'Bilecik - Eskisehir',   85.0,  'LOW',    'Bilecik',   'Eskisehir'),
  ('S17', 'Balikesir - Kutahya',   180.0, 'LOW',    'Balikesir', 'Kutahya'),
  ('S18', 'Kutahya - Eskisehir',   140.0, 'LOW',    'Kutahya',   'Eskisehir')
  ON CONFLICT (segment_id) DO NOTHING;


-- ② SENSORS (her segment için 2 sensör)
-- ============================================================
-- Truncate/Delete is not used to avoid breaking references, using ON CONFLICT logic if available
-- Assuming fresh start or id-based mapping.
INSERT INTO sensor (sensor_type, segment_id, status) VALUES
  ('RAY_SENSOR',   'S1', 'ACTIVE'), ('TRAIN_SENSOR', 'S1', 'ACTIVE'),
  ('RAY_SENSOR',   'S2', 'ACTIVE'), ('TRAIN_SENSOR', 'S2', 'ACTIVE'),
  ('RAY_SENSOR',   'S3', 'ACTIVE'), ('TRAIN_SENSOR', 'S3', 'ACTIVE'),
  ('RAY_SENSOR',   'S4', 'ACTIVE'), ('TRAIN_SENSOR', 'S4', 'ACTIVE'),
  ('RAY_SENSOR',   'S5', 'ACTIVE'), ('TRAIN_SENSOR', 'S5', 'ACTIVE'),
  ('RAY_SENSOR',   'S6', 'ACTIVE'), ('TRAIN_SENSOR', 'S6', 'ACTIVE'),
  ('RAY_SENSOR',   'S7', 'ACTIVE'), ('TRAIN_SENSOR', 'S7', 'ACTIVE'),
  ('RAY_SENSOR',   'S8', 'ACTIVE'), ('TRAIN_SENSOR', 'S8', 'ACTIVE'),
  ('RAY_SENSOR',   'S9', 'ACTIVE'), ('TRAIN_SENSOR', 'S9', 'ACTIVE'),
  ('RAY_SENSOR',   'S10', 'ACTIVE'), ('TRAIN_SENSOR', 'S10', 'ACTIVE'),
  ('RAY_SENSOR',   'S11', 'ACTIVE'), ('TRAIN_SENSOR', 'S11', 'ACTIVE'),
  ('RAY_SENSOR',   'S12', 'ACTIVE'), ('TRAIN_SENSOR', 'S12', 'ACTIVE'),
  ('RAY_SENSOR',   'S13', 'ACTIVE'), ('TRAIN_SENSOR', 'S13', 'ACTIVE'),
  ('RAY_SENSOR',   'S14', 'ACTIVE'), ('TRAIN_SENSOR', 'S14', 'ACTIVE'),
  ('RAY_SENSOR',   'S15', 'ACTIVE'), ('TRAIN_SENSOR', 'S15', 'ACTIVE'),
  ('RAY_SENSOR',   'S16', 'ACTIVE'), ('TRAIN_SENSOR', 'S16', 'ACTIVE'),
  ('RAY_SENSOR',   'S17', 'ACTIVE'), ('TRAIN_SENSOR', 'S17', 'ACTIVE'),
  ('RAY_SENSOR',   'S18', 'ACTIVE'), ('TRAIN_SENSOR', 'S18', 'ACTIVE');


-- ③ SENSOR CHANNELS (Backend MqttSensorIngestionService ile %100 Uyumlu)
-- ============================================================

-- RAY_SENSOR kanalları
INSERT INTO sensor_channel (sensor_id, channel_name, unit)
SELECT s.sensor_id, ch.channel_name, ch.unit
FROM sensor s
CROSS JOIN (
    VALUES
      ('temperature',  '°C'),
      ('vibrationX',   'Hz'),
      ('vibrationY',   'Hz'),
      ('vibrationZ',   'Hz'),
      ('rail_slope',   '°')
) AS ch(channel_name, unit)
WHERE s.sensor_type = 'RAY_SENSOR';

-- TRAIN_SENSOR kanalları
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


-- ④ SENSOR READINGS (Örnek Telemetri Akışı)
-- ============================================================
INSERT INTO sensor_reading (channel_id, recorded_at, value)
SELECT
    ch.channel_id,
    NOW() - (gs.n * INTERVAL '3 minutes'),
    CASE ch.channel_name
        WHEN 'temperature'       THEN 25.0  + random() * 15.0
        WHEN 'vibrationX'        THEN 0.5   + random() * 2.0
        WHEN 'vibrationY'        THEN 0.4   + random() * 1.5
        WHEN 'vibrationZ'        THEN 0.6   + random() * 2.5
        WHEN 'rail_slope'        THEN -1.0  + random() * 2.0
        WHEN 'train_temperature' THEN 30.0  + random() * 10.0
        WHEN 'train_speed'       THEN 70.0  + random() * 30.0
        WHEN 'train_vibration_x' THEN 1.5   + random() * 2.0
        ELSE 0.0
    END
FROM sensor_channel ch
CROSS JOIN generate_series(1, 15) AS gs(n);


-- ⑤ DİĞER VARLIKLAR (LOKOMOTİF, ROTA VB.)
-- ============================================================
INSERT INTO locomotive (model, power_kw, max_speed, status) VALUES
  ('TCDD DE33000', 2200, 120, 'ACTIVE'),
  ('TCDD DE11000', 1500, 100, 'ACTIVE')
ON CONFLICT DO NOTHING;

INSERT INTO route (start_point, end_point, total_energy, total_risk, is_optimal, segment_path, route_rank) VALUES
  ('Izmir', 'Bandirma', 850.5, 0.15, true, 'S1,S2,S3,S4,S5,S6', 1);

INSERT INTO train (locomotive_id, route_id, wagon_count, total_weight, current_speed)
VALUES (1, 1, 8, 450.0, 85.0);

INSERT INTO train_location (train_id, segment_id, latitude, longitude, last_update)
VALUES (1, 'S2', 38.6191, 27.4289, NOW())
ON CONFLICT (train_id) DO UPDATE SET
  segment_id = EXCLUDED.segment_id,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  last_update = EXCLUDED.last_update;

-- ⑥ ANOMALİ VE RİSK VERİLERİ
-- ============================================================
INSERT INTO anomaly (segment_id, anomaly_type, severity, detected_time, measured_value, threshold_value, description) VALUES
  ('S5', 'CRITICAL_TEMP', 'HIGH', NOW() - INTERVAL '10 minutes', 42.50, 40.00, 'Yüksek ray sıcaklığı tespit edildi.'),
  ('S3', 'VIBRATION_ALERT', 'MEDIUM', NOW() - INTERVAL '25 minutes', 2.80, 2.50, 'Sıradışı titreşim seviyesi.')
ON CONFLICT DO NOTHING;

INSERT INTO energy_risk (segment_id, energy_consumption, risk_score, calculated_time) VALUES
  ('S1', 120.0, 0.1, NOW()), ('S2', 140.0, 0.15, NOW()),
  ('S3', 180.0, 0.3, NOW()), ('S4', 210.0, 0.12, NOW()),
  ('S5', 250.0, 0.45, NOW()), ('S6', 190.0, 0.1, NOW());

-- S1-S6 segmentleri için ilk temiz/normal yapay zeka analiz geçmişinin oluşturulması
INSERT INTO anomaly_result (segment_id, sensor_id, detected_at, anomaly_score, is_anomaly, model_type, xai_explanation, channel_name, severity) VALUES
('S1', (SELECT sensor_id FROM sensor WHERE segment_id = 'S1' AND sensor_type = 'RAY_SENSOR' LIMIT 1), NOW(), 0.12, false, 'IsolationForest', 'Model kararı stabil. RMS ve FFT Energy spektrumları normal sınırlar içerisinde.', 'vibrationX', 'LOW'),
('S2', (SELECT sensor_id FROM sensor WHERE segment_id = 'S2' AND sensor_type = 'RAY_SENSOR' LIMIT 1), NOW(), 0.08, false, 'IsolationForest', 'Model kararı stabil. Herhangi bir yapısal sapma gözlemlenmedi.', 'vibrationX', 'LOW'),
('S3', (SELECT sensor_id FROM sensor WHERE segment_id = 'S3' AND sensor_type = 'RAY_SENSOR' LIMIT 1), NOW(), 0.15, false, 'IsolationForest', 'Model kararı stabil. Titreşim genliği operasyonel tolerans dahilinde.', 'vibrationX', 'LOW'),
('S4', (SELECT sensor_id FROM sensor WHERE segment_id = 'S4' AND sensor_type = 'RAY_SENSOR' LIMIT 1), NOW(), 0.11, false, 'IsolationForest', 'Model kararı stabil. Hat geometrisi sismik olarak kararlı.', 'vibrationX', 'LOW'),
('S5', (SELECT sensor_id FROM sensor WHERE segment_id = 'S5' AND sensor_type = 'RAY_SENSOR' LIMIT 1), NOW(), 0.19, false, 'IsolationForest', 'Model kararı stabil. Sinyal-gürültü oranı (SNR) ideal seviyede.', 'vibrationX', 'LOW'),
('S6', (SELECT sensor_id FROM sensor WHERE segment_id = 'S6' AND sensor_type = 'RAY_SENSOR' LIMIT 1), NOW(), 0.05, false, 'IsolationForest', 'Model kararı stabil. Eğim katsayısı ve vibrasyon dengeli.', 'vibrationX', 'LOW');