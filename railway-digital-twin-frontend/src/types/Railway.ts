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

/**
 * Backend'in /api/telemetry endpoint'inden gelen gerçek format.
 * Her kayıt tek bir sensor_reading'i temsil eder (normalize DB yapısı).
 */
export interface TelemetryReading {
    readingId?: number;       // DB'deki primary key
    channelId?: number;       // Bağlı olduğu kanal ID'si
    recordedAt: string;       // ISO 8601 timestamp
    value: number;
    channelName: string;      // örn: "ray_temperature", "train_speed"
    unit: string;             // örn: "°C", "km/h"
    sensorType?: string;
    sensorId: number;
    segmentId: string;        // S1, S2, ...
    segmentName?: string;
    riskLevel?: string;
}

/**
 * Backend'den gelen TelemetryReading listesini frontend grafiklerinin
 * beklediği düz formata dönüştürür.
 * Aynı segment'e ait readings'leri birleştirir.
 */
export function groupTelemetryBySegment(readings: TelemetryReading[]): Record<string, Record<string, number>> {
    const result: Record<string, Record<string, number>> = {};
    for (const r of readings) {
        if (!result[r.segmentId]) result[r.segmentId] = {};
        result[r.segmentId][r.channelName] = r.value;
        result[r.segmentId]['timestamp'] = new Date(r.recordedAt).getTime();
        result[r.segmentId]['segmentId'] = r.segmentId as any;
    }
    return result;
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
    waypoints?: { lat: number; lng: number }[];
}

export interface Train {
    id: string;
    name: string;
    maxLoad: number; // in tons
    currentStationId?: string;
    destinationStationId?: string;
    totalLoad: number; // Current total weight in tons
}

export interface TrainLocation {
    trainId: number;
    latitude: number;
    longitude: number;
    lastUpdate: string;
    segmentId: string;
    segmentName?: string;
    segmentRiskLevel?: string;
}

export interface RailwayNetwork {
    stations: Station[];
    tracks: Track[];
}

// ===================== XAI & EXPLAINABILITY TYPES =====================

export interface FeatureImportance {
    featureName: string;
    importance: number; // 0-1
    baseValue?: number;
    contribution?: number;
    description?: string;
}

export interface SHAPExplanation {
    prediction: number;
    baseValue: number;
    features: FeatureImportance[];
    globalImportance: FeatureImportance[];
    visualUrl?: string;
}

export interface LIMEExplanation {
    prediction: number;
    localAccuracy: number;
    features: FeatureImportance[];
    predictedLabel: string;
    probability: number;
}

export interface XAIExplanation {
    anomalyId?: number;
    type: 'SHAP' | 'LIME' | 'COUNTERFACTUAL';
    explanation: SHAPExplanation | LIMEExplanation;
    narrative: string; // Doğal dil açıklaması
    keyFactors: string[];
    actionItems: string[];
}

// ===================== ANOMALY TYPES =====================

export interface Anomaly {
    anomalyId: number;
    segmentId: string;
    segmentName?: string;
    anomalyType: 'TEMPERATURE_SPIKE' | 'VIBRATION_ANOMALY' | 'SLOPE_DEVIATION' | 'SPEED_ANOMALY' | 'COMBINED';
    detectedAt: string; // ISO timestamp
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    score: number; // 0-100
    description: string;
    affectedSensors: number[];
    predictedRUL?: number; // Days remaining
    xaiExplanation?: XAIExplanation;
    recommendedActions: string[];
}

export interface AnomalyTimeline {
    date: string;
    anomalies: Anomaly[];
    totalCount: number;
    criticalCount: number;
    resolutionStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
}

// ===================== ENERGY & RISK TYPES =====================

export interface EnergyProfile {
    segmentId: string;
    segmentName?: string;
    estimatedConsumption: number; // kWh
    baselineConsumption: number;
    deviation: number; // % difference
    efficiency: number; // 0-100 score
    regenerationPotential?: number; // kWh
    factors: {
        slope: number; // % contribution
        temperature: number;
        speed: number;
        vibration: number;
        weather?: number;
    };
}

export interface RiskAssessment {
    segmentId: string;
    segmentName?: string;
    riskScore: number; // 0-100
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    factors: {
        temperatureRisk: number;
        vibrationRisk: number;
        slopeRisk: number;
        speedRisk: number;
        infrastructureAge: number;
    };
    safetyMargin: number; // %
    maintenanceTrend: 'IMPROVING' | 'STABLE' | 'DEGRADING';
}

export interface EnergyRiskProfile {
    energyData: EnergyProfile;
    riskData: RiskAssessment;
    tradeoff: 'ENERGY_EFFICIENT' | 'BALANCED' | 'SAFETY_FIRST';
    recommendations: string[];
}

// ===================== ROUTE OPTIMIZATION TYPES =====================

export interface RouteOption {
    routeId: string;
    segmentSequence: string[]; // Array of segment IDs
    totalDistance: number;
    estimatedTime: number; // minutes
    totalEnergy: number; // kWh
    riskLevel: number; // 0-100
    cost: number;
    energyEfficiency: number; // 0-100
    safetyScore: number; // 0-100
    overallScore: number; // Weighted score
    advantages: string[];
    disadvantages: string[];
    isOptimal: boolean;
}

export interface RouteComparison {
    origin: string;
    destination: string;
    optimalRoute: RouteOption;
    alternativeRoutes: RouteOption[];
    comparisonMetrics: {
        energySaving: number; // %
        timeSaving: number; // %
        riskReduction: number; // %
    };
}

// ===================== REPORT TYPES =====================

export interface MaintenanceRecommendation {
    segmentId: string;
    priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
    action: string;
    estimatedCost: number;
    estimatedDowntime: number; // hours
    expectedBenefits: string[];
    deadline?: string; // ISO date
}

export interface ExecutiveReport {
    generatedAt: string;
    systemStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL';
    summary: string;
    keyMetrics: {
        overallEfficiency: number;
        averageRisk: number;
        maintenanceNeeded: number;
        anomaliesDetected: number;
    };
    topIssues: Anomaly[];
    recommendations: MaintenanceRecommendation[];
    nextActions: string[];
}

export interface DetailedReport extends ExecutiveReport {
    anomalySummary: {
        total: number;
        bySegment: Record<string, number>;
        bySeverity: Record<string, number>;
        timeline: AnomalyTimeline[];
    };
    energyAnalysis: EnergyProfile[];
    riskAnalysis: RiskAssessment[];
    routeOptimizationResults: RouteComparison[];
    mlOpsMetrics?: {
        modelAccuracy: number;
        lastRetraining: string;
        dataQuality: number;
    };
}

// ===================== QUERY & RESPONSE TYPES =====================

export interface ReportQuery {
    reportType: 'EXECUTIVE' | 'DETAILED' | 'TECHNICAL';
    dateRange?: {
        start: string;
        end: string;
    };
    segments?: string[];
    includeXAI: boolean;
    includeForecasts: boolean;
    language?: 'TR' | 'EN';
}

export interface ReportResponse {
    report: ExecutiveReport | DetailedReport;
    narrativeReport: string; // Generative AI tarafından oluşturulmuş doğal dil raporu
    visualizations: {
        anomalyChart?: string; // URL or base64
        energyChart?: string;
        riskChart?: string;
        timelineChart?: string;
    };
}
