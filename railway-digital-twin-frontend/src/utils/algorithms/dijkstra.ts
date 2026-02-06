import { RailwayNetwork, Track } from '../../types/Railway';

interface RouteResult {
    path: Track[];
    totalCost: number;
}

export function findShortestPath(network: RailwayNetwork, startStationId: string, endStationId: string, trainLoad: number = 0): RouteResult | null {
    const distances: { [key: string]: number } = {};
    const previous: { [key: string]: Track | null } = {};
    const visited: Set<string> = new Set();
    const queue: string[] = [];

    // Initialize distances
    network.stations.forEach(station => {
        distances[station.id] = Infinity;
        previous[station.id] = null;
        queue.push(station.id);
    });

    distances[startStationId] = 0;

    while (queue.length > 0) {
        // Sort queue by distance (simple priority queue simulation)
        queue.sort((a, b) => distances[a] - distances[b]);
        const currentStationId = queue.shift();

        if (!currentStationId) break;
        if (currentStationId === endStationId) break; // Reached destination
        if (distances[currentStationId] === Infinity) break; // Remaining nodes are unreachable

        visited.add(currentStationId);

        // Find outgoing tracks
        const outgoingTracks = network.tracks.filter(t => t.sourceStationId === currentStationId);

        for (const track of outgoingTracks) {
            const neighborId = track.targetStationId;
            if (visited.has(neighborId)) continue;

            // ENTERPRISE LOGIC 🏢

            // 1. Availability Check: Avoid closed segments
            if (track.status === 'closed') {
                continue;
            }

            // PHYSICS ENGINE LOGIC 🚂

            // 1. Constraint: Maximum Axle Load
            // Assumption: Heavy trains (> 800 tons) need 22.5t axle load lines.
            if (trainLoad > 800 && track.maxAxleLoad < 22.5) {
                continue; // Train too heavy for this track structure
            }

            // 2. Constraint: Gradient (Slope)
            // Heavy trains (> 1000 tons) cannot climb steep gradients (> 2.0%)
            if (trainLoad > 1000 && track.gradient > 2.0) {
                continue; // Too steep!
            }

            // 3. Cost Calculation: Energy Efficiency
            // Base cost is distance.
            // Add penalty for gradient: +50% cost per 1% gradient.
            const gradientPenalty = 1 + (track.gradient * 0.5);
            const effectiveCost = track.distance * gradientPenalty;

            const alt = distances[currentStationId] + effectiveCost;
            if (alt < distances[neighborId]) {
                distances[neighborId] = alt;
                previous[neighborId] = track;
            }
        }
    }

    // Reconstruction
    const path: Track[] = [];
    let current = endStationId;

    if (distances[current] === Infinity) return null; // No path found

    while (current !== startStationId) {
        const track = previous[current];
        if (!track) return null; // Should not happen if path exists
        path.unshift(track);
        current = track.sourceStationId;
    }

    return {
        path,
        totalCost: distances[endStationId]
    };
}
