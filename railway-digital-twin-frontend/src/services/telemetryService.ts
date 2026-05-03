import { TelemetryReading } from "../types/Railway";

const API_URL = "http://localhost:8080/api";

export const telemetryService = {

    /**
     * Backend'den son telemetri kayıtlarını getirir.
     * Her kayıt normalize DB'den tek bir sensor_reading satırıdır.
     * @param limit Kaç kayıt getirileceği (varsayılan: 100)
     */
    async getLatestTelemetry(limit: number = 100): Promise<TelemetryReading[]> {
    try {
        const response = await fetch(`${API_URL}/telemetry?size=${limit}`);
        if (!response.ok) throw new Error("Network response was not ok");

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
    async getTelemetryBySegment(segmentId: string, limit: number = 50): Promise<TelemetryReading[]> {
    try {
        const response = await fetch(`${API_URL}/telemetry/${segmentId}?size=${limit}`);
        if (!response.ok) throw new Error("Network response was not ok");

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
        try {
            await fetch(`${API_URL}/telemetry`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channelId, value })
            });
        } catch (error) {
            console.error("Error sending telemetry:", error);
        }
    }
};
