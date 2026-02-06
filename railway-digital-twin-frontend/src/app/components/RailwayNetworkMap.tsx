import { MapPin } from "lucide-react";
import { RailwayNetwork, Track } from "../../types/Railway";

interface RailwayNetworkMapProps {
  network: RailwayNetwork | null;
  activeRoute?: {
    startStation?: string;
    endStation?: string;
    result?: {
      path: Track[];
      totalCost: number;
    }
  };
}

export function RailwayNetworkMap({ network, activeRoute }: RailwayNetworkMapProps) {
  if (!network) return <div className="text-white">Harita yükleniyor...</div>;

  // Normalize coordinates to 0-100% for SVG rendering
  // Find min/max lat/lng
  const lats = network.stations.map((s) => s.coordinates.lat);
  const lngs = network.stations.map((s) => s.coordinates.lng);

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  // Add some padding
  const padding = 0.1; // degrees
  const latRange = maxLat - minLat + padding * 2;
  const lngRange = maxLng - minLng + padding * 2;

  const getX = (lng: number) => ((lng - (minLng - padding)) / lngRange) * 100;
  const getY = (lat: number) => 100 - ((lat - (minLat - padding)) / latRange) * 100; // Y is inverted in SVG

  // Define route set for quick lookup
  const routeTrackIds = new Set(activeRoute?.result?.path.map(t => t.id) || []);

  const getStatusColor = (stationId: string) => {
    if (activeRoute?.startStation === network.stations.find(s => s.id === stationId)?.name) return "#3b82f6"; // Blue start
    if (activeRoute?.endStation === network.stations.find(s => s.id === stationId)?.name) return "#10b981"; // Green end
    return "#6b7280"; // Grey default
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white">Demiryolu Ağı - Dijital İkiz (Gerçek Zamanlı Veri)</h3>
        <div className="flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-400">Başlangıç</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-400">Varış</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-yellow-400/50 rounded"></div>
            <span className="text-gray-400">Optimize Rota</span>
          </div>
        </div>
      </div>

      <div className="relative bg-gray-900 rounded-lg p-8 h-96 border border-gray-700 overflow-hidden">
        <svg className="w-full h-full">
          {/* Draw all tracks (background) */}
          {network.tracks.map((track) => {
            const source = network.stations.find((s) => s.id === track.sourceStationId);
            const target = network.stations.find((s) => s.id === track.targetStationId);

            if (!source || !target) return null;

            const isRoute = routeTrackIds.has(track.id);

            return (
              <line
                key={track.id}
                x1={`${getX(source.coordinates.lng)}%`}
                y1={`${getY(source.coordinates.lat)}%`}
                x2={`${getX(target.coordinates.lng)}%`}
                y2={`${getY(target.coordinates.lat)}%`}
                stroke={isRoute ? "#fbbf24" : "#374151"}
                strokeWidth={isRoute ? "3" : "1"}
                strokeOpacity={isRoute ? 1 : 0.5}
              />
            );
          })}

          {/* Draw route animation (overlay) */}
          {activeRoute?.result?.path.map((track) => {
            const source = network.stations.find((s) => s.id === track.sourceStationId);
            const target = network.stations.find((s) => s.id === track.targetStationId);
            if (!source || !target) return null;

            return (
              <circle key={`train-${track.id}`} r="3" fill="#fbbf24">
                <animateMotion
                  dur="1.5s"
                  repeatCount="indefinite"
                  path={`M${getX(source.coordinates.lng)}% ${getY(source.coordinates.lat)}% L${getX(target.coordinates.lng)}% ${getY(target.coordinates.lat)}%`}
                />
              </circle>
            )
          })}


          {/* Draw stations */}
          {network.stations.map((station) => (
            <g key={station.id}>
              <circle
                cx={`${getX(station.coordinates.lng)}%`}
                cy={`${getY(station.coordinates.lat)}%`}
                r="4"
                fill={getStatusColor(station.id)}
                className="transition-all hover:r-6 cursor-pointer"
              />
              <text
                x={`${getX(station.coordinates.lng)}%`}
                y={`${getY(station.coordinates.lat) - 2}%`}
                textAnchor="middle"
                fill="white"
                fontSize="10"
                className="pointer-events-none font-semibold drop-shadow-md"
              >
                {station.name}
              </text>
            </g>
          ))}
        </svg>

        <div className="absolute bottom-4 right-4 bg-gray-800 p-3 rounded border border-gray-700">
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{network.stations.length} Aktif İstasyon</span>
          </div>
        </div>
      </div>
    </div>
  );
}
