const API_URL = "http://localhost:8080/api";

export interface EnergyRiskResult {
  recordId: number | null;
  energyConsumption: number | null;
  calculatedTime: string | null;
  segmentRiskLevel: string | null;

  segmentId: string;
  segmentName: string;
  riskScore: number;

  temperature: number;
  vibration: number;
  tilt: number;
  energyScore: number;
  riskLevel: string;
  recommendation: string;
}

export const energyRiskService = {
  async getCurrentEnergyRisks(): Promise<EnergyRiskResult[]> {
    try {
      const response = await fetch(`${API_URL}/energy-risks/current`);

      if (!response.ok) {
        throw new Error("Could not fetch energy-risk results");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching energy-risk results:", error);
      return [];
    }
  }
};