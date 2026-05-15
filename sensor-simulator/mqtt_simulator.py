import json
import time
import random
import hmac
import hashlib
import paho.mqtt.client as mqtt
from datetime import datetime

BROKER = "mosquitto"
PORT = 1883
TOPIC = "railway/sensors/data"
SECRET_KEY = b"railway-digital-twin-secret"

client = mqtt.Client()
client.connect(BROKER, PORT, 60)

segments = [
    {"segmentId": "S1", "sensorId": 1},
    {"segmentId": "S2", "sensorId": 2},
    {"segmentId": "S3", "sensorId": 3},
    {"segmentId": "S4", "sensorId": 4},
    {"segmentId": "S5", "sensorId": 5},
    {"segmentId": "S6", "sensorId": 6}
]

# ================== 🔽 EKLENEN KISIM (ROUTE) 🔽 ==================

# Segment → koordinat eşleşmesi
segment_coords = {
    "S1": (38.4192, 27.1287),
    "S2": (38.4210, 27.1305),
    "S3": (38.4230, 27.1330),
    "S4": (38.4250, 27.1360),
    "S5": (38.4275, 27.1400),
    "S6": (38.4300, 27.1450)
}

# Tren rotası (segment sırasına göre)
route = ["S1", "S2", "S3", "S4", "S5", "S6"]

current_index = 0
progress = 0.0
step = 0.2  # hız

# ================== 🔼 EKLENEN KISIM 🔼 ==================

while True:

    # ================== 🔽 EKLENEN KISIM (KONUM HESABI) 🔽 ==================
    start_seg = route[current_index]
    end_seg = route[(current_index + 1) % len(route)]

    start = segment_coords[start_seg]
    end = segment_coords[end_seg]

    lat = start[0] + (end[0] - start[0]) * progress
    lon = start[1] + (end[1] - start[1]) * progress

    progress += step

    if progress >= 1:
        progress = 0
        current_index = (current_index + 1) % len(route)
    # ================== 🔼 EKLENEN KISIM 🔼 ==================

    for seg in segments:
        segment = seg["segmentId"]
        sensorId = seg["sensorId"]

        # Normal değerler
        temperature = random.uniform(25, 35)
        vibration = random.uniform(0.5, 1.5)
        tilt = random.uniform(0.5, 2)

        # 🔥 S5 → sıcaklık anomalisi
        if segment == "S5":
            temperature = random.uniform(45, 60)

        # ⚠️ S3 → vibration anomalisi
        if segment == "S3":
            vibration = random.uniform(3, 5)

        timestamp = datetime.now().isoformat()
        samplingFrequency = 100.0

        map_payload = {
            "samplingFrequency": samplingFrequency,
            "segmentId": segment,
            "sensorId": sensorId,
            "sensorType": "RAY_SENSOR",
            "temperature": temperature,
            "tilt": tilt,
            "timestamp": timestamp,
            "vibration": vibration,

            # ================== 🔽 EKLENEN KISIM 🔽 ==================
            "lat": lat,
            "lon": lon
            # ================== 🔼 EKLENEN KISIM 🔼 ==================
        }

        json_payload = json.dumps(map_payload, separators=(',', ':'))

        crc_hash = hashlib.sha256(json_payload.encode('utf-8')).hexdigest()

        signature = hmac.new(
            SECRET_KEY,
            crc_hash.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        payload = map_payload.copy()
        payload["crcHash"] = crc_hash
        payload["digitalSignature"] = signature

        client.publish(TOPIC, json.dumps(payload))
        print(f"Sent: {payload}")

    time.sleep(2)