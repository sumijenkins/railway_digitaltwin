const API_URL = "http://localhost:8080/api";

export interface XaiFeatureImportance {
  feature: string;
  importance: number;
}

export interface XaiTopFactor {
  feature: string;
  reason: string;
  severity: string;
}

export interface XaiExplanation {
  explanation: string;
  method: string;
  featureImportance: XaiFeatureImportance[];
  keyFactors: string[];
  recommendedActions: string[];
  topFactors: XaiTopFactor[];
}

export const xaiService = {
  async explainFeature(featurePayload: Record<string, number>): Promise<XaiExplanation> {
    const response = await fetch(`${API_URL}/xai/explain`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(featurePayload),
    });

    if (!response.ok) {
      throw new Error("XAI explanation could not be loaded");
    }

    return response.json();
  },

  async explainFeatureForSegment(segmentId: string): Promise<XaiExplanation> {
    const response = await fetch(`${API_URL}/xai/explain/${segmentId}`);
    if (!response.ok) {
      throw new Error("XAI explanation could not be loaded");
    }
    return response.json();
  },
};