import { Station, Track, RailwayNetwork } from '../types/Railway';

// Helper to calculate distance between two coordinates (Haversine formula approximation)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Simple seeded random number generator (Linear Congruential Generator)
class SeededRandom {
    private seed: number;

    constructor(seed: number) {
        this.seed = seed;
    }

    // Returns a number between 0 and 1
    next(): number {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
}

export function generateNetwork(numStations: number = 20, connectionProbability: number = 0.3): RailwayNetwork {
    const stations: Station[] = [];
    const tracks: Track[] = [];
    const rng = new SeededRandom(12345); // Fixed seed for consistency

    // Generate Stations roughly around a central point (e.g., Central Anatolia for generic TR map feel)
    const centerLat = 39.0;
    const centerLng = 35.0;
    const spread = 5.0; // +/- degree spread

    for (let i = 0; i < numStations; i++) {
        stations.push({
            id: `station-${i}`,
            name: `Station ${String.fromCharCode(65 + (i % 26))}${i > 25 ? Math.floor(i / 26) : ''}`,
            coordinates: {
                lat: centerLat + (rng.next() - 0.5) * spread,
                lng: centerLng + (rng.next() - 0.5) * spread,
            },
            capacity: Math.floor(rng.next() * 10) + 5,
        });
    }

    // Generate Tracks
    // Ensure network is somewhat connected by connecting each node to its k nearest neighbors
    // and then adding some random connections.

    stations.forEach((source) => {
        // Find all potential targets sorted by distance
        const potentialTargets = stations
            .filter(s => s.id !== source.id)
            .map(target => ({
                target,
                dist: getDistance(source.coordinates.lat, source.coordinates.lng, target.coordinates.lat, target.coordinates.lng)
            }))
            .sort((a, b) => a.dist - b.dist);

        // Connect to minimal number of closest stations to ensure graph is not too sparse
        // e.g., connect to nearest 2
        for (let i = 0; i < 2; i++) {
            const targetData = potentialTargets[i];
            if (targetData) {
                addTrackIfNotExists(tracks, source, targetData.target, targetData.dist, rng);
            }
        }

        // Add random long-distance connections
        potentialTargets.slice(2).forEach(pt => {
            if (rng.next() < connectionProbability / 5) { // Lower prob for further stations
                addTrackIfNotExists(tracks, source, pt.target, pt.dist, rng);
            }
        });

    });

    return { stations, tracks };
}

function addTrackIfNotExists(tracks: Track[], source: Station, target: Station, dist: number, rng: SeededRandom) {
    // Check if connection already exists (undirected or directed check)
    // Here we treat tracks as bidirectional for simplicity in generation,
    // but represented as two directed edges or one undirected edge depending on usage.
    // For now, let's create a single track entry representing a bidirectional link or just one way.
    // Dijkstra typically works on directed graphs, so let's add two tracks for bidirectional.

    const exists = tracks.some(t => t.sourceStationId === source.id && t.targetStationId === target.id);
    if (!exists) {
        // Track A -> B
        tracks.push({
            id: `track-${source.id}-${target.id}`,
            sourceStationId: source.id,
            targetStationId: target.id,
            distance: dist,
            speedLimit: 60 + rng.next() * 60, // 60-120 km/h
            cost: dist, // simplistic cost
            gradient: rng.next() * 3, // 0-3% gradient
            maxAxleLoad: 20 + rng.next() * 5, // 20-25 tons
            status: 'operational' as const,
            healthScore: Math.floor(70 + rng.next() * 30), // 70-100
            accumulatedTonnage: Math.floor(rng.next() * 5_000_000), // up to 5M tons
            lastInspectionDate: '2024-01-15'
        });

        // Track B -> A (Assuming bidirectional travel is possible on same 'line' logic)
        tracks.push({
            id: `track-${target.id}-${source.id}`,
            sourceStationId: target.id,
            targetStationId: source.id,
            distance: dist,
            speedLimit: 60 + rng.next() * 60, // may differ slightly? Let's keep distinct
            cost: dist,
            gradient: rng.next() * 3,
            maxAxleLoad: 20 + rng.next() * 5,
            status: 'operational' as const,
            healthScore: Math.floor(70 + rng.next() * 30),
            accumulatedTonnage: Math.floor(rng.next() * 5_000_000),
            lastInspectionDate: '2024-01-15'
        });
    }
}
