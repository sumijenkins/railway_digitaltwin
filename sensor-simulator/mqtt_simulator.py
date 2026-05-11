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

while True:
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

        # Construct dictionary exactly as LinkedHashMap in Java
        map_payload = {
            "samplingFrequency": samplingFrequency,
            "segmentId": segment,
            "sensorId": sensorId,
            "sensorType": "RAY_SENSOR",
            "temperature": temperature,
            "tilt": tilt,
            "timestamp": timestamp,
            "vibration": vibration
        }

        # JSON serialize without spaces to match Jackson mapper.writeValueAsString
        json_payload = json.dumps(map_payload, separators=(',', ':'))

        # Calculate crcHash
        crc_hash = hashlib.sha256(json_payload.encode('utf-8')).hexdigest()

        # Calculate digitalSignature
        signature = hmac.new(SECRET_KEY, crc_hash.encode('utf-8'), hashlib.sha256).hexdigest()

        # Full payload
        payload = map_payload.copy()
        payload["crcHash"] = crc_hash
        payload["digitalSignature"] = signature

        client.publish(TOPIC, json.dumps(payload))
        print(f"Sent: {payload}")

    time.sleep(2)