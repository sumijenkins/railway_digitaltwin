import json
import random
import time
import hashlib
import hmac
from datetime import datetime
import paho.mqtt.client as mqtt

BROKER = "localhost"
PORT = 1883

SECRET_KEY = b"railway-digital-twin-secret"

segments = ["S1", "S2", "S3", "S4", "S5", "S6"]

SENSORS = {
    "S1": 109,
    "S2": 110,
    "S3": 111,
    "S4": 112,
    "S5": 113,
    "S6": 114
}

client = mqtt.Client()
client.connect(BROKER, PORT, 60)


def calculate_crc_hash(payload_without_security):
    payload_string = json.dumps(payload_without_security, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload_string.encode("utf-8")).hexdigest()


def calculate_digital_signature(crc_hash):
    return hmac.new(
        SECRET_KEY,
        crc_hash.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()


def generate_sensor_data(segment_id):
    temperature = round(random.uniform(25, 38), 2)
    vibration_x = round(random.uniform(0.5, 2.2), 2)
    vibration_y = round(random.uniform(0.3, 1.8), 2)
    vibration_z = round(random.uniform(0.3, 1.8), 2)
    tilt = round(random.uniform(-1.5, 1.5), 2)

    if segment_id == "S5" and random.random() < 0.25:
        temperature = round(random.uniform(41, 48), 2)

    if segment_id == "S3" and random.random() < 0.20:
        vibration_x = round(random.uniform(2.8, 4.0), 2)

    payload = {
        "sensorId": SENSORS[segment_id],
        "segmentId": segment_id,
        "sensorType": "RAY_SENSOR",
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "samplingFrequency": 10,
        "temperature": temperature,
        "vibrationX": vibration_x,
        "vibrationY": vibration_y,
        "vibrationZ": vibration_z,
        "tilt": tilt
    }

    crc_hash = calculate_crc_hash(payload)
    digital_signature = calculate_digital_signature(crc_hash)

    payload["crcHash"] = crc_hash
    payload["digitalSignature"] = digital_signature

    return payload


while True:
    for segment in segments:
        data = generate_sensor_data(segment)
        topic = f"railway/sensors/{segment}"

        client.publish(topic, json.dumps(data))
        print(f"Published to {topic}: {data}")

    time.sleep(3)