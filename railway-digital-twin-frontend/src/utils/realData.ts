import { RailwayNetwork, Station, Track } from '../types/Railway';

export function getRealNetwork(): RailwayNetwork {
    const stations: Station[] = [
        { id: 'izm-c', name: 'İzmir (Basmane)', coordinates: { lat: 38.42267263747876, lng: 27.143597979812448 }, capacity: 25 },
        { id: 'men', name: 'Menemen', coordinates: { lat: 38.60334832700944, lng: 27.07665201927256 }, capacity: 12 },
        { id: 'man', name: 'Manisa', coordinates: { lat: 38.621218233484846, lng: 27.435550945815486 }, capacity: 20 },
        { id: 'akh', name: 'Akhisar', coordinates: { lat: 38.908436425779755, lng: 27.79088726897313 }, capacity: 8 },
        { id: 'som', name: 'Soma', coordinates: { lat: 39.19845112736171, lng: 27.62428719412454 }, capacity: 8 },
        { id: 'bal', name: 'Balıkesir', coordinates: { lat: 39.64709401593245, lng: 27.888409267161126 }, capacity: 15 },
        { id: 'sus', name: 'Susurluk', coordinates: { lat: 39.92560265466861, lng: 28.153097524947572 }, capacity: 6 },
        { id: 'ban', name: 'Bandırma', coordinates: { lat: 40.350456061706964, lng: 27.959458577048487 }, capacity: 10 },
    ];
    const tracks: Track[] = [
        // S1: İzmir - Menemen - Manisa Hattı
        { id: 'S1', sourceStationId: 'izm-c', targetStationId: 'men', distance: 25, speedLimit: 80, cost: 25, gradient: 0.2, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 35, vibrationLevel: 2, trafficDensity: 0.6 }, healthScore: 95, accumulatedTonnage: 300000, lastInspectionDate: '2026-01-10' },
        { id: 'S1-R', sourceStationId: 'men', targetStationId: 'izm-c', distance: 25, speedLimit: 80, cost: 25, gradient: 0.2, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 34, vibrationLevel: 1.8, trafficDensity: 0.5 }, healthScore: 94, accumulatedTonnage: 310000, lastInspectionDate: '2026-01-10' },

        { id: 'S2', sourceStationId: 'men', targetStationId: 'man', distance: 30, speedLimit: 90, cost: 30, gradient: 0.8, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 36, vibrationLevel: 2.1, trafficDensity: 0.4 }, healthScore: 92, accumulatedTonnage: 400000, lastInspectionDate: '2025-12-15' },
        { id: 'S2-R', sourceStationId: 'man', targetStationId: 'men', distance: 30, speedLimit: 90, cost: 30, gradient: 0.8, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 35, vibrationLevel: 2, trafficDensity: 0.3 }, healthScore: 91, accumulatedTonnage: 410000, lastInspectionDate: '2025-12-15' },

        // S3: Manisa - Akhisar
        { id: 'S3', sourceStationId: 'man', targetStationId: 'akh', distance: 52, speedLimit: 110, cost: 52, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 38, vibrationLevel: 2.5, trafficDensity: 0.2 }, healthScore: 88, accumulatedTonnage: 600000, lastInspectionDate: '2025-10-15' },
        { id: 'S3-R', sourceStationId: 'akh', targetStationId: 'man', distance: 52, speedLimit: 110, cost: 52, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 38, vibrationLevel: 2.5, trafficDensity: 0.2 }, healthScore: 87, accumulatedTonnage: 620000, lastInspectionDate: '2025-10-15' },

        // S4: Akhisar - Soma
        { id: 'S4', sourceStationId: 'akh', targetStationId: 'som', distance: 45, speedLimit: 100, cost: 45, gradient: 1.2, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 42, vibrationLevel: 3, trafficDensity: 0.5 }, healthScore: 92, accumulatedTonnage: 800000, lastInspectionDate: '2025-09-10' },
        { id: 'S4-R', sourceStationId: 'som', targetStationId: 'akh', distance: 45, speedLimit: 100, cost: 45, gradient: 1.2, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 42, vibrationLevel: 3, trafficDensity: 0.4 }, healthScore: 91, accumulatedTonnage: 820000, lastInspectionDate: '2025-09-10' },

        // S5: Soma - Balıkesir
        { id: 'S5', sourceStationId: 'som', targetStationId: 'bal', distance: 88, speedLimit: 120, cost: 88, gradient: 0.9, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 40, vibrationLevel: 2.8, trafficDensity: 0.3 }, healthScore: 85, accumulatedTonnage: 1100000, lastInspectionDate: '2025-08-05' },
        { id: 'S5-R', sourceStationId: 'bal', targetStationId: 'som', distance: 88, speedLimit: 120, cost: 88, gradient: 0.9, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 40, vibrationLevel: 2.8, trafficDensity: 0.2 }, healthScore: 84, accumulatedTonnage: 1150000, lastInspectionDate: '2025-08-05' },

        // S6: Balıkesir - Susurluk
        { id: 'S6', sourceStationId: 'bal', targetStationId: 'sus', distance: 45, speedLimit: 90, cost: 45, gradient: 1.5, maxAxleLoad: 20, status: 'operational', telemetry: { axleTemp: 45, vibrationLevel: 4, trafficDensity: 0.2 }, healthScore: 90, accumulatedTonnage: 2500000, lastInspectionDate: '2025-11-30' },
        { id: 'S6-R', sourceStationId: 'sus', targetStationId: 'bal', distance: 45, speedLimit: 90, cost: 45, gradient: 1.5, maxAxleLoad: 20, status: 'operational', telemetry: { axleTemp: 45, vibrationLevel: 4, trafficDensity: 0.1 }, healthScore: 89, accumulatedTonnage: 2550000, lastInspectionDate: '2025-11-30' },

        // S7: Susurluk - Bandırma
        { id: 'S7', sourceStationId: 'sus', targetStationId: 'ban', distance: 42, speedLimit: 80, cost: 42, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 38, vibrationLevel: 2, trafficDensity: 0.1 }, healthScore: 94, accumulatedTonnage: 500000, lastInspectionDate: '2025-12-05' },
        { id: 'S7-R', sourceStationId: 'ban', targetStationId: 'sus', distance: 42, speedLimit: 80, cost: 42, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 38, vibrationLevel: 2, trafficDensity: 0.1 }, healthScore: 93, accumulatedTonnage: 520000, lastInspectionDate: '2025-12-05' },
    ];

    return { stations, tracks };
}
