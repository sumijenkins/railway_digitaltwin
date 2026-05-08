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
    }
};