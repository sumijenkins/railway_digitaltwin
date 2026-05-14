const API_URL = "http://localhost:8080/api";

export interface RulPrediction {
  rulId: number;
  segmentId: string;
  sensorId: number;
  featureId: number | null;
  predictedAt: string;
  remainingLifeDays: number;
  degradationScore: number;
  confidence: number;
  condition: string;
  trend: string;
  modelType: string;
  recommendedAction: string;
  confidenceLowerBound: number;
  confidenceUpperBound: number;
  degradationTrend: string;
  maintenancePriority: string;
}

export const rulService = {
  async predictRul(featurePayload: Record<string, any>): Promise<RulPrediction> {
    const response = await fetch(`${API_URL}/rul/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(featurePayload),
    });

    if (!response.ok) {
      throw new Error("RUL prediction could not be loaded");
    }

    return response.json();
  },
};