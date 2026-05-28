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
        // ================= İZMİR - ANKARA =================

        { id: 'usa', name: 'Uşak', coordinates: { lat: 38.66330660376905, lng: 29.407306390125306 }, capacity: 10 },

        { id: 'afy', name: 'Afyonkarahisar', coordinates: { lat: 38.76444085780987, lng: 30.55221334512441 }, capacity: 14 },

        { id: 'esk', name: 'Eskişehir', coordinates: { lat: 39.779422631049854, lng: 30.50755731079922 }, capacity: 20 },

        { id: 'ank', name: 'Ankara', coordinates: { lat: 39.93493196324444, lng: 32.84291546717592 }, capacity: 30 },

        // ================= İSTANBUL - ANKARA =================

        { id: 'ist', name: 'İstanbul (Pendik)', coordinates: { lat: 40.991104548665646, lng: 29.037874196066277 }, capacity: 25 },

        { id: 'geb', name: 'Gebze', coordinates: { lat: 40.784312142510174, lng: 29.410974808987206 }, capacity: 16 },

        { id: 'izm', name: 'İzmit', coordinates: { lat: 40.7618554139102, lng: 29.917694338382987 }, capacity: 18 },

        { id: 'ari', name: 'Arifiye', coordinates: { lat: 40.71359589862593, lng: 30.355624648174597 }, capacity: 12 },

        { id: 'bil', name: 'Bilecik', coordinates: { lat: 40.13510660808482, lng: 30.0091246990767 }, capacity: 10 },
        { id: 'kut', name: 'Kutahya', coordinates: { lat: 39.42065264525376, lng: 30.000481922971368 }, capacity: 14 },
    ];
    const tracks: Track[] = [
        // S1: İzmir - Manisa (Direct link, bypasses Menemen logically in Graph)
        { id: 'S1', sourceStationId: 'izm-c', targetStationId: 'man', distance: 55, speedLimit: 80, cost: 55, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 35, vibrationLevel: 2, trafficDensity: 0.6 }, healthScore: 95, accumulatedTonnage: 300000, lastInspectionDate: '2026-01-10' },
        { id: 'S1-R', sourceStationId: 'man', targetStationId: 'izm-c', distance: 55, speedLimit: 80, cost: 55, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 34, vibrationLevel: 1.8, trafficDensity: 0.5 }, healthScore: 94, accumulatedTonnage: 310000, lastInspectionDate: '2026-01-10' },

        // S2: Manisa - Akhisar
        { id: 'S2', sourceStationId: 'man', targetStationId: 'akh', distance: 52, speedLimit: 110, cost: 52, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 38, vibrationLevel: 2.5, trafficDensity: 0.2 }, healthScore: 88, accumulatedTonnage: 600000, lastInspectionDate: '2025-10-15' },
        { id: 'S2-R', sourceStationId: 'akh', targetStationId: 'man', distance: 52, speedLimit: 110, cost: 52, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 38, vibrationLevel: 2.5, trafficDensity: 0.2 }, healthScore: 87, accumulatedTonnage: 620000, lastInspectionDate: '2025-10-15' },

        // S3: Akhisar - Soma
        { id: 'S3', sourceStationId: 'akh', targetStationId: 'som', distance: 45, speedLimit: 100, cost: 45, gradient: 1.2, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 42, vibrationLevel: 3, trafficDensity: 0.5 }, healthScore: 92, accumulatedTonnage: 800000, lastInspectionDate: '2025-09-10' },
        { id: 'S3-R', sourceStationId: 'som', targetStationId: 'akh', distance: 45, speedLimit: 100, cost: 45, gradient: 1.2, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 42, vibrationLevel: 3, trafficDensity: 0.4 }, healthScore: 91, accumulatedTonnage: 820000, lastInspectionDate: '2025-09-10' },

        // S4: Soma - Balıkesir
        { id: 'S4', sourceStationId: 'som', targetStationId: 'bal', distance: 88, speedLimit: 120, cost: 88, gradient: 0.9, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 40, vibrationLevel: 2.8, trafficDensity: 0.3 }, healthScore: 85, accumulatedTonnage: 1100000, lastInspectionDate: '2025-08-05' },
        { id: 'S4-R', sourceStationId: 'bal', targetStationId: 'som', distance: 88, speedLimit: 120, cost: 88, gradient: 0.9, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 40, vibrationLevel: 2.8, trafficDensity: 0.2 }, healthScore: 84, accumulatedTonnage: 1150000, lastInspectionDate: '2025-08-05' },

        // S5: Balıkesir - Susurluk
        { id: 'S5', sourceStationId: 'bal', targetStationId: 'sus', distance: 45, speedLimit: 90, cost: 45, gradient: 1.5, maxAxleLoad: 20, status: 'operational', telemetry: { axleTemp: 45, vibrationLevel: 4, trafficDensity: 0.2 }, healthScore: 90, accumulatedTonnage: 2500000, lastInspectionDate: '2025-11-30' },
        { id: 'S5-R', sourceStationId: 'sus', targetStationId: 'bal', distance: 45, speedLimit: 90, cost: 45, gradient: 1.5, maxAxleLoad: 20, status: 'operational', telemetry: { axleTemp: 45, vibrationLevel: 4, trafficDensity: 0.1 }, healthScore: 89, accumulatedTonnage: 2550000, lastInspectionDate: '2025-11-30' },

        // S7: Susurluk - Bandırma
        { id: 'S7', sourceStationId: 'sus', targetStationId: 'ban', distance: 42, speedLimit: 80, cost: 42, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 38, vibrationLevel: 2, trafficDensity: 0.1 }, healthScore: 94, accumulatedTonnage: 500000, lastInspectionDate: '2025-12-05' },
        { id: 'S7-R', sourceStationId: 'ban', targetStationId: 'sus', distance: 42, speedLimit: 80, cost: 42, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 38, vibrationLevel: 2, trafficDensity: 0.1 }, healthScore: 93, accumulatedTonnage: 520000, lastInspectionDate: '2025-12-05' },


        // ================= İZMİR - ANKARA =================

        // S8: Manisa - Uşak
        { id: 'S8', sourceStationId: 'man', targetStationId: 'usa', distance: 210, speedLimit: 120, cost: 210, gradient: 1.0, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 37, vibrationLevel: 2.4, trafficDensity: 0.3 }, healthScore: 91, accumulatedTonnage: 700000, lastInspectionDate: '2026-01-12' },
        { id: 'S8-R', sourceStationId: 'usa', targetStationId: 'man', distance: 210, speedLimit: 120, cost: 210, gradient: 1.0, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 37, vibrationLevel: 2.4, trafficDensity: 0.3 }, healthScore: 90, accumulatedTonnage: 710000, lastInspectionDate: '2026-01-12' },

        // S9: Uşak - Afyonkarahisar
        { id: 'S9', sourceStationId: 'usa', targetStationId: 'afy', distance: 115, speedLimit: 110, cost: 115, gradient: 0.9, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 35, vibrationLevel: 2.1, trafficDensity: 0.2 }, healthScore: 93, accumulatedTonnage: 650000, lastInspectionDate: '2026-01-11' },
        { id: 'S9-R', sourceStationId: 'afy', targetStationId: 'usa', distance: 115, speedLimit: 110, cost: 115, gradient: 0.9, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 35, vibrationLevel: 2.1, trafficDensity: 0.2 }, healthScore: 92, accumulatedTonnage: 660000, lastInspectionDate: '2026-01-11' },

        // S10: Afyon - Eskişehir
        { id: 'S10', sourceStationId: 'afy', targetStationId: 'esk', distance: 145, speedLimit: 140, cost: 145, gradient: 0.7, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 36, vibrationLevel: 2.0, trafficDensity: 0.4 }, healthScore: 95, accumulatedTonnage: 900000, lastInspectionDate: '2026-01-09' },
        { id: 'S10-R', sourceStationId: 'esk', targetStationId: 'afy', distance: 145, speedLimit: 140, cost: 145, gradient: 0.7, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 36, vibrationLevel: 2.0, trafficDensity: 0.4 }, healthScore: 94, accumulatedTonnage: 910000, lastInspectionDate: '2026-01-09' },

        // S11: Eskişehir - Ankara
        { id: 'S11', sourceStationId: 'esk', targetStationId: 'ank', distance: 235, speedLimit: 250, cost: 235, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 34, vibrationLevel: 1.6, trafficDensity: 0.8 }, healthScore: 97, accumulatedTonnage: 1500000, lastInspectionDate: '2026-01-05' },
        { id: 'S11-R', sourceStationId: 'ank', targetStationId: 'esk', distance: 235, speedLimit: 250, cost: 235, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 34, vibrationLevel: 1.6, trafficDensity: 0.8 }, healthScore: 96, accumulatedTonnage: 1510000, lastInspectionDate: '2026-01-05' },

        // S12: Istanbul - Gebze
        { id: 'S12', sourceStationId: 'ist', targetStationId: 'geb', distance: 55, speedLimit: 120, cost: 55, gradient: 0.3, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 37, vibrationLevel: 2.1, trafficDensity: 0.7 }, healthScore: 96, accumulatedTonnage: 700000, lastInspectionDate: '2026-01-15' },
        { id: 'S12-R', sourceStationId: 'geb', targetStationId: 'ist', distance: 55, speedLimit: 120, cost: 55, gradient: 0.3, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 36, vibrationLevel: 2.0, trafficDensity: 0.6 }, healthScore: 95, accumulatedTonnage: 710000, lastInspectionDate: '2026-01-15' },

        // S13: Gebze - Izmit
        { id: 'S13', sourceStationId: 'geb', targetStationId: 'izm', distance: 50, speedLimit: 110, cost: 50, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 38, vibrationLevel: 2.3, trafficDensity: 0.5 }, healthScore: 94, accumulatedTonnage: 800000, lastInspectionDate: '2026-01-10' },
        { id: 'S13-R', sourceStationId: 'izm', targetStationId: 'geb', distance: 50, speedLimit: 110, cost: 50, gradient: 0.5, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 37, vibrationLevel: 2.2, trafficDensity: 0.4 }, healthScore: 93, accumulatedTonnage: 820000, lastInspectionDate: '2026-01-10' },

        // S14: Izmit - Arifiye
        { id: 'S14', sourceStationId: 'izm', targetStationId: 'ari', distance: 42, speedLimit: 100, cost: 42, gradient: 0.7, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 39, vibrationLevel: 2.5, trafficDensity: 0.4 }, healthScore: 92, accumulatedTonnage: 900000, lastInspectionDate: '2025-12-20' },
        { id: 'S14-R', sourceStationId: 'ari', targetStationId: 'izm', distance: 42, speedLimit: 100, cost: 42, gradient: 0.7, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 38, vibrationLevel: 2.4, trafficDensity: 0.3 }, healthScore: 91, accumulatedTonnage: 910000, lastInspectionDate: '2025-12-20' },

        // S15: Arifiye - Bilecik
        { id: 'S15', sourceStationId: 'ari', targetStationId: 'bil', distance: 95, speedLimit: 120, cost: 95, gradient: 1.0, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 40, vibrationLevel: 2.8, trafficDensity: 0.3 }, healthScore: 90, accumulatedTonnage: 1200000, lastInspectionDate: '2025-11-15' },
        { id: 'S15-R', sourceStationId: 'bil', targetStationId: 'ari', distance: 95, speedLimit: 120, cost: 95, gradient: 1.0, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 39, vibrationLevel: 2.7, trafficDensity: 0.2 }, healthScore: 89, accumulatedTonnage: 1210000, lastInspectionDate: '2025-11-15' },

        // S16: Bilecik - Eskisehir
        { id: 'S16', sourceStationId: 'bil', targetStationId: 'esk', distance: 85, speedLimit: 130, cost: 85, gradient: 0.6, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 41, vibrationLevel: 3.0, trafficDensity: 0.4 }, healthScore: 88, accumulatedTonnage: 1400000, lastInspectionDate: '2025-10-30' },
        { id: 'S16-R', sourceStationId: 'esk', targetStationId: 'bil', distance: 85, speedLimit: 130, cost: 85, gradient: 0.6, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 40, vibrationLevel: 2.9, trafficDensity: 0.3 }, healthScore: 87, accumulatedTonnage: 1410000, lastInspectionDate: '2025-10-30' },

        // S17: Balikesir - Kutahya
        { id: 'S17', sourceStationId: 'bal', targetStationId: 'kut', distance: 180, speedLimit: 90, cost: 180, gradient: 1.2, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 39, vibrationLevel: 2.5, trafficDensity: 0.2 }, healthScore: 90, accumulatedTonnage: 700000, lastInspectionDate: '2026-01-10' },
        { id: 'S17-R', sourceStationId: 'kut', targetStationId: 'bal', distance: 180, speedLimit: 90, cost: 180, gradient: 1.2, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 39, vibrationLevel: 2.5, trafficDensity: 0.2 }, healthScore: 89, accumulatedTonnage: 710000, lastInspectionDate: '2026-01-10' },

        // S18: Kutahya - Eskisehir
        { id: 'S18', sourceStationId: 'kut', targetStationId: 'esk', distance: 140, speedLimit: 110, cost: 140, gradient: 0.7, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 36, vibrationLevel: 2.2, trafficDensity: 0.3 }, healthScore: 93, accumulatedTonnage: 600000, lastInspectionDate: '2026-01-08' },
        { id: 'S18-R', sourceStationId: 'esk', targetStationId: 'kut', distance: 140, speedLimit: 110, cost: 140, gradient: 0.7, maxAxleLoad: 22.5, status: 'operational', telemetry: { axleTemp: 36, vibrationLevel: 2.2, trafficDensity: 0.3 }, healthScore: 92, accumulatedTonnage: 610000, lastInspectionDate: '2026-01-08' },
    ];

    return { stations, tracks };
}
