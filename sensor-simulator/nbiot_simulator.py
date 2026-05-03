import json
import random
import time
import hashlib
import hmac
from datetime import datetime

import requests

BACKEND_URL = "http://localhost:8080/api/nbiot/sensors"

SECRET_KEY = b"railway-digital-twin-secret"

segments = ["S1", "S2", "S3", "S4", "S5", "S6"]


def calculate_crc_hash(payload_without_security):
    payload_string = json.dumps(
        payload_without_security,
        sort_keys=True,
        separators=(",", ":")
    )
    return hashlib.sha256(payload_string.encode("utf-8")).hexdigest()


def calculate_digital_signature(crc_hash):
    return hmac.new(
        SECRET_KEY,
        crc_hash.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()


def generate_nbiot_sensor_data(segment_id):
    temperature = round(random.uniform(25, 38), 2)
    vibration = round(random.uniform(0.5, 2.2), 2)
    tilt = round(random.uniform(-1.5, 1.5), 2)

    if segment_id == "S5" and random.random() < 0.25:
        temperature = round(random.uniform(41, 48), 2)

    if segment_id == "S3" and random.random() < 0.20:
        vibration = round(random.uniform(2.8, 4.0), 2)

    core_payload = {
        "sensorId": f"RAY-{segment_id}-001",
        "segmentId": segment_id,
        "sensorType": "RAY_SENSOR",
        "timestamp": datetime.now().isoformat(timespec="seconds"),
        "samplingFrequency": 10,
        "temperature": temperature,
        "vibration": vibration,
        "tilt": tilt
    }

    crc_hash = calculate_crc_hash(core_payload)
    digital_signature = calculate_digital_signature(crc_hash)

    nbiot_payload = {
        "deviceImei": f"35976208{random.randint(1000000, 9999999)}",
        "gatewayId": "NB-IOT-GW-IZMIR-001",
        "signalStrength": random.randint(-95, -65),

        **core_payload,

        "crcHash": crc_hash,
        "digitalSignature": digital_signature
    }

    return nbiot_payload


while True:
    for segment in segments:
        data = generate_nbiot_sensor_data(segment)

        try:
            response = requests.post(BACKEND_URL, json=data, timeout=5)

            print(f"POST {BACKEND_URL}")
            print(f"Status: {response.status_code}")
            print(f"Payload: {data}")
            print("-" * 80)

        except requests.exceptions.RequestException as e:
            print(f"NB-IoT transmission failed for {segment}: {e}")

    time.sleep(5)