import json
import time
import random
import paho.mqtt.client as mqtt
from datetime import datetime

BROKER = "localhost"
PORT = 1883
TOPIC = "railway/sensors/data"

client = mqtt.Client()
client.connect(BROKER, PORT, 60)

segments = ["S1", "S2", "S3", "S4", "S5", "S6"]

while True:
    for segment in segments:

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

        payload = {
            "segmentId": segment,
            "sensorType": "RAY_SENSOR",
            "temperature": temperature,
            "vibration": vibration,
            "tilt": tilt,
            "timestamp": datetime.now().isoformat()
        }

        client.publish(TOPIC, json.dumps(payload))
        print(f"Sent: {payload}")

    time.sleep(2)