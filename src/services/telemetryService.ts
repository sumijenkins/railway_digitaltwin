import { DetailedTelemetry } from "../types/Railway";

const API_URL = "http://localhost:5000/api";

export const telemetryService = {
    // Fetch latest telemetry for all segments
    async getLatestTelemetry(): Promise<DetailedTelemetry[]> {
        try {
            const response = await fetch(`${API_URL}/telemetry`);
            if (!response.ok) throw new Error("Network response was not ok");
            return await response.json();
        } catch (error) {
            console.error("Error fetching telemetry:", error);
            return [];
        }
    },

    // Send new telemetry (IoT simulation)
    async sendTelemetry(data: Omit<DetailedTelemetry, 'timestamp'>): Promise<void> {
        try {
            await fetch(`${API_URL}/telemetry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error("Error sending telemetry:", error);
        }
    }
};
