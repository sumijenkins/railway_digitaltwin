import { TelemetryReading } from "../types/Railway";

const API_URL = "http://localhost:8080/api";
const USE_MOCK_DATA = false; // false: gerçek backend API, true: mock veri

// Mock veri generator
function generateMockTelemetry(limit: number): TelemetryReading[] {
  const segments = ["S1", "S2", "S3", "S4", "S5", "S6"];
  const readings: TelemetryReading[] = [];
  const channelNames = [
    "ray_temperature",
    "ray_vibration_x",
    "rail_slope",
    "train_temperature",
    "train_speed",
    "train_vibration_x",
  ];

  for (let i = 0; i < limit; i++) {
    const segmentId = segments[Math.floor(Math.random() * segments.length)];
    const channelName = channelNames[Math.floor(Math.random() * channelNames.length)];
    const recordedAt = new Date(Date.now() - i * 3 * 60 * 1000).toISOString();

    let value = 0;

    switch (channelName) {
      case "ray_temperature":
        value = 25 + Math.random() * 20;
        break;
      case "ray_vibration_x":
        value = 0.5 + Math.random() * 3.5;
        break;
      case "rail_slope":
        value = -2 + Math.random() * 4;
        break;
      case "train_temperature":
        value = 30 + Math.random() * 15;
        break;
      case "train_speed":
        value = 60 + Math.random() * 40;
        break;
      case "train_vibration_x":
        value = 1 + Math.random() * 2.5;
        break;
      default:
        value = 0;
        break;
    }

    readings.push({
      sensorId: Math.floor(Math.random() * 12) + 1,
      segmentId,
      channelName,
      channelId: Math.floor(Math.random() * 18) + 1,
      value: parseFloat(value.toFixed(2)),
      recordedAt,
      unit: channelName.includes("temperature")
        ? "°C"
        : channelName.includes("vibration")
          ? "Hz"
          : channelName.includes("speed")
            ? "km/h"
            : "°",
    });
  }

  return readings;
}

export const telemetryService = {
  /**
   * Backend'den son telemetri kayıtlarını getirir.
   * Her kayıt normalize DB'den tek bir sensor_reading satırıdır.
   * @param limit Kaç kayıt getirileceği (varsayılan: 100)
   */
  async getLatestTelemetry(limit: number = 100): Promise<TelemetryReading[]> {
    if (USE_MOCK_DATA) {
      return generateMockTelemetry(limit);
    }

    try {
      const response = await fetch(`${API_URL}/telemetry?size=${limit}`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      return data.content ?? data;
    } catch (error) {
      console.error("Error fetching telemetry:", error);
      return [];
    }
  },

  /**
   * Belirli bir segment için telemetri getirir.
   */
  async getTelemetryBySegment(
    segmentId: string,
    limit: number = 50
  ): Promise<TelemetryReading[]> {
    if (USE_MOCK_DATA) {
      return generateMockTelemetry(limit).filter((r) => r.segmentId === segmentId);
    }

    try {
      const response = await fetch(`${API_URL}/telemetry/${segmentId}?size=${limit}`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      return data.content ?? data;
    } catch (error) {
      console.error(`Error fetching telemetry for segment ${segmentId}:`, error);
      return [];
    }
  },

  /**
   * Yeni bir sensor reading kaydeder.
   * @param channelId Kanal ID'si (sensor_channel tablosundan)
   * @param value Ölçüm değeri
   */
  async sendReading(channelId: number, value: number): Promise<void> {
    if (USE_MOCK_DATA) {
      console.log("Mock mode: Telemetry reading saved locally", { channelId, value });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/telemetry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channelId, value }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      console.error("Error sending telemetry:", error);
    }
  },

  
};