import json
import random
import time
import hashlib
import hmac
from datetime import datetime
import paho.mqtt.client as mqtt

import urllib.request
import urllib.error

BROKER = "mosquitto"
PORT = 1883
TOPIC = "railway/sensors/data"
SECRET_KEY = b"railway-digital-twin-secret"

# Default fallback list supporting all 18 segments
segments = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "S11", "S12", "S13", "S14", "S15", "S16", "S17", "S18"]

SCENARIO = "normal"

def get_sensor_id(segment_id):
    try:
        # Extract number from segment id, e.g. "S18" -> 18, "S2" -> 2
        num = int("".join(filter(str.isdigit, segment_id)))
        return 108 + num
    except Exception:
        return random.randint(109, 300)

last_segment_fetch_time = 0

def update_segments():
    global segments, last_segment_fetch_time
    current_time = time.time()
    # Fetch at most once every 30 seconds to avoid spamming
    if current_time - last_segment_fetch_time < 30:
        return
    
    last_segment_fetch_time = current_time
    try:
        url = "http://backend:8080/api/segments?size=100"
        with urllib.request.urlopen(url, timeout=3) as req:
            if req.status == 200:
                resp_data = json.loads(req.read().decode())
                content = resp_data.get("content", [])
                if content:
                    new_segments = [seg["segmentId"] for seg in content]
                    # Natural sort segments
                    new_segments.sort(key=lambda s: int("".join(filter(str.isdigit, s))) if any(c.isdigit() for c in s) else s)
                    segments = new_segments
                    print(f"[{datetime.now().isoformat()}] Dynamically updated segments from backend: {segments}")
    except Exception as e:
        print(f"[{datetime.now().isoformat()}] Failed to fetch dynamic segments from backend (using current list): {e}")

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
    temperature = round(random.uniform(25, 35), 2)
    vibration_x = round(random.uniform(0.5, 1.8), 2)
    vibration_y = round(random.uniform(0.3, 1.5), 2)
    vibration_z = round(random.uniform(0.3, 1.5), 2)
    tilt = round(random.uniform(-1.0, 1.0), 2)

    train_speed = round(random.uniform(50, 80), 2)
    train_temperature = round(random.uniform(22, 35), 2)
    train_vibration_x = round(random.uniform(0.3, 1.6), 2)

    if SCENARIO == "high_temperature":
        if segment_id == "S5":
            temperature = round(random.uniform(42, 50), 2)
            train_temperature = round(random.uniform(38, 45), 2)

    elif SCENARIO == "high_vibration":
        if segment_id == "S3":
            vibration_x = round(random.uniform(3.0, 4.5), 2)
            vibration_y = round(random.uniform(2.0, 3.0), 2)
            vibration_z = round(random.uniform(2.0, 3.0), 2)
            train_vibration_x = round(random.uniform(2.5, 3.8), 2)

    elif SCENARIO == "slope_deformation":
        if segment_id == "S4":
            tilt = round(random.uniform(2.0, 3.5), 2)

    elif SCENARIO == "mixed_critical":
        if segment_id == "S3":
            vibration_x = round(random.uniform(3.0, 4.5), 2)
            vibration_y = round(random.uniform(2.0, 3.0), 2)
            vibration_z = round(random.uniform(2.0, 3.0), 2)
            train_vibration_x = round(random.uniform(2.5, 3.8), 2)

        if segment_id == "S5":
            temperature = round(random.uniform(42, 50), 2)
            train_temperature = round(random.uniform(38, 45), 2)

        if segment_id == "S4":
            tilt = round(random.uniform(2.0, 3.5), 2)

        if segment_id == "S2":
            train_speed = round(random.uniform(90, 110), 2)

    payload = {
        "sensorId": get_sensor_id(segment_id),
        "segmentId": segment_id,
        "sensorType": "RAY_SENSOR",
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "samplingFrequency": 10,
        "temperature": temperature,
        "vibrationX": vibration_x,
        "vibrationY": vibration_y,
        "vibrationZ": vibration_z,
        "tilt": tilt,
        "trainSpeed": train_speed,
        "trainTemperature": train_temperature,
        "trainVibrationX": train_vibration_x,
    }

    crc_hash = calculate_crc_hash(payload)
    digital_signature = calculate_digital_signature(crc_hash)

    payload["crcHash"] = crc_hash
    payload["digitalSignature"] = digital_signature

    return payload


while True:
    update_segments()
    for segment in segments:
        data = generate_sensor_data(segment)
        topic = f"railway/sensors/{segment}"

        client.publish(topic, json.dumps(data))
        print(f"Published to {topic}: {data}")

    time.sleep(3)