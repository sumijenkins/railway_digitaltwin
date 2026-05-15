const API_URL = "http://localhost:8080/api";

export interface ScenarioRequestDto {
    segmentId: string;
    raySicakligi?: number;
    rayTitresimi?: number;
    hatEgimi?: number;
    vagonSicakligi?: number;
    trenHizi?: number;
    vagonTitresimi?: number;
}

export interface ScenarioResponseDto {
    simulatedRul: number;
    simulatedAnomaly: boolean;
    riskLevel: string;
    explanation: string;
}

export interface SensorFeature {
    featureId?: number;
    segmentId: string;
    sensorId: number;
    recordedAt: string;

    rms: number;
    rmsX?: number;
    rmsY?: number;
    rmsZ?: number;

    peakToPeak: number;
    fftEnergy: number;
    slopeGradient: number;

    meanValue: number;
    standardDeviation: number;
    snr: number;

    dataLossRate: number;
}

function isNoDataResponse(data: any): boolean {
    return !data || data.status === "NO_DATA";
}

export const scenarioService = {
    /**
     * SENARYO SIMULATION
     */
    simulateScenario: async (
        request: ScenarioRequestDto
    ): Promise<ScenarioResponseDto> => {
        try {
            const response = await fetch(`${API_URL}/scenario/simulate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                const details = await response.text().catch(() => "Detay alınamadı");
                throw new Error(`Simulation failed (${response.status}): ${details}`);
            }

            const data = await response.json();
            return data as ScenarioResponseDto;
        } catch (error) {
            throw error;
        }
    },

    /**
     * SON SENSOR VERİSİ
     */
    getLatestData: async (
        segmentId: string
    ): Promise<SensorFeature | null> => {
        try {
            const response = await fetch(
                `${API_URL}/scenario/latest/${segmentId}`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                    },
                }
            );

            // Backend 200 dönüp boş body döndürüyor → BU KRİTİK FIX
            const text = await response.text();

            if (!text || text.trim().length === 0) {
                console.warn("Empty response from backend (no sensor data)");
                return null;
            }

            const data = JSON.parse(text);

            if (isNoDataResponse(data)) {
                console.warn("No sensor data available");
                return null;
            }

            return data.data as SensorFeature;
        } catch (error) {
            console.error("Error fetching latest data:", error);
            return null;
        }
    }
};