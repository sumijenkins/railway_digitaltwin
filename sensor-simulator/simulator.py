import json
import random
import time
from datetime import datetime
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883

segments = ["S1", "S2", "S3", "S4", "S5", "S6"]

client = mqtt.Client()
client.connect(BROKER, PORT, 60)

def generate_sensor_data(segment_id):
    temperature = round(random.uniform(25, 38), 2)
    vibration = round(random.uniform(0.5, 2.2), 2)
    tilt = round(random.uniform(-1.5, 1.5), 2)

    # Simulated anomalies
    if segment_id == "S5" and random.random() < 0.25:
        temperature = round(random.uniform(41, 48), 2)

    if segment_id == "S3" and random.random() < 0.20:
        vibration = round(random.uniform(2.8, 4.0), 2)

    payload = {
        "segmentId": segment_id,
        "sensorType": "RAY_SENSOR",
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "temperature": temperature,
        "vibration": vibration,
        "tilt": tilt
    }

    return payload

while True:
    for segment in segments:
        data = generate_sensor_data(segment)
        topic = f"railway/sensors/{segment}"

        client.publish(topic, json.dumps(data))
        print(f"Published to {topic}: {data}")

    time.sleep(3)