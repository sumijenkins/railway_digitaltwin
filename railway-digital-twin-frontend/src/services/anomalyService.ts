const API_URL = "http://localhost:8080/api";

export interface BackendAnomaly {
  anomalyId: number;
  anomalyType: string;
  severity: string;
  detectedTime: string;
  segmentId: string;
  segmentName: string;
  measuredValue: number;
  thresholdValue: number;
  description: string;
}

export interface BackendAnomalyResult {
  anomalyId: number;
  segmentId: string;
  sensorId: number;
  detectedAt: string;
  anomalyScore: number;
  isAnomaly: boolean;
  modelType: string;
  xaiExplanation: string;
  severity: string | null;
  channelName: string | null;
  featureId: number | null;
}

export const anomalyService = {
  async getLatestAnomalies(limit: number = 20): Promise<BackendAnomaly[]> {
    try {
      const response = await fetch(`${API_URL}/anomalies?size=${limit}`);

      if (!response.ok) {
        throw new Error("Could not fetch anomalies");
      }

      const data = await response.json();
      return data.content ?? data;
    } catch (error) {
      console.error("Error fetching anomalies:", error);
      return [];
    }
  },

  async getLatestAnomalyResults(): Promise<BackendAnomalyResult[]> {
    try {
      const response = await fetch(`${API_URL}/anomaly-results`);

      if (!response.ok) {
        throw new Error("Could not fetch anomaly results");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching anomaly results:", error);
      return [];
    }
  },
};