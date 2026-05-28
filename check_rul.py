import urllib.request
import json

try:
    url = "http://localhost:8080/api/segments?size=100"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        print("--- Segments Page Content ---")
        for seg in data.get('content', []):
            print(f"Segment: {seg.get('segmentId')} - {seg.get('segmentName')}")
except Exception as e:
    print(f"Error querying segments: {e}")
