export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Station {
    id: string;
    name: string;
    coordinates: Coordinates;
    capacity?: number; // Optional: Max trains station can hold
}

export interface DetailedTelemetry {
    timestamp: string;
    segmentId: string;
    rayTemperature: number;
    trainTemperature: number;
    ambientTemperature: number;
    rayVibration: { x: number; y: number; z: number };
    trainVibration: { x: number; y: number; z: number };
    railSlope: number;
    trainSpeed: number;
    trainWeight: number;
}

export interface TelemetryData {
    axleTemp: number;
    vibrationLevel: number;
    trafficDensity: number; // 0.0 to 1.0
    detailed?: DetailedTelemetry; // Link to new DB schema
}

export interface Track {
    id: string;
    sourceStationId: string;
    targetStationId: string;
    distance: number; // in km
    speedLimit: number; // in km/h
    cost: number; // generic cost based on distance/speed/traffic
    gradient: number; // Slope in percentage (e.g. 2.5%)
    maxAxleLoad: number; // Max weight per axle in tons (e.g. 22.5)
    status: "operational" | "maintenance" | "closed";
    telemetry?: TelemetryData;
    healthScore: number; // 0-100
    accumulatedTonnage: number; // in tons
    lastInspectionDate: string;
}

export interface Train {
    id: string;
    name: string;
    maxLoad: number; // in tons
    currentStationId?: string;
    destinationStationId?: string;
    totalLoad: number; // Current total weight in tons
}

export interface RailwayNetwork {
    stations: Station[];
    tracks: Track[];
}
