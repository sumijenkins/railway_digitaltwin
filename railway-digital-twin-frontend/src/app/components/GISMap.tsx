import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RailwayNetwork, Track } from '../../types/Railway';
import { useEffect, memo, useRef, useState } from 'react';
import { LatLngExpression } from 'leaflet';

interface GISMapProps {
    network: RailwayNetwork | null;
    activeRoute?: {
        startStation?: string;
        endStation?: string;
        result?: {
            path: Track[];
            totalCost: number;
        }
    };
    viewMode?: 'status' | 'maintenance';
    selectedTrackId?: string | null;
    onSelectTrack?: (id: string) => void;
}

// Helper to fit bounds
function MapBounds({ network }: { network: RailwayNetwork | null }) {
    const map = useMap();
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (!network || network.stations.length === 0) return;
        if (hasInitialized.current) return;

        const lats = network.stations.map(s => s.coordinates.lat);
        const lngs = network.stations.map(s => s.coordinates.lng);

        map.fitBounds([
            [Math.min(...lats), Math.min(...lngs)],
            [Math.max(...lats), Math.max(...lngs)]
        ], { padding: [50, 50] });

        hasInitialized.current = true;
    }, [network, map]);

    return null;
}

export const GISMap = memo(function GISMap({ network, activeRoute, viewMode = 'status', selectedTrackId, onSelectTrack }: GISMapProps) {
    const [railwayGeoJson, setRailwayGeoJson] = useState<any>(null);
    const [basmaneMenemenGeoJson, setBasmaneMenemenGeoJson] = useState<any>(null);

        useEffect(() => {
            fetch("/data/menemen-bandirma-railway.geojson")
                .then((res) => res.json())
                .then((data) => setRailwayGeoJson(data))
                .catch((err) => console.error("GeoJSON could not be loaded:", err));
                
            fetch("/data/basmane-menemen-railway.geojson")
                .then((res) => res.json())
                .then((data) => setBasmaneMenemenGeoJson(data))
                .catch((err) => console.error("Basmane-Menemen GeoJSON could not be loaded:", err));
        }, []);
        
    if (!network) return <div className="text-white">Harita verisi bekleniyor...</div>;

    const routeTrackIds = new Set(activeRoute?.result?.path.map(t => t.id) || []);

    const getHealthColor = (score: number) => {
        if (score > 80) return '#10B981'; // Green
        if (score > 50) return '#F59E0B'; // Yellow/Orange
        return '#EF4444'; // Red
    };

    return (
        <div className="bg-gray-800 rounded-lg p-1 border border-gray-700 h-[500px] overflow-hidden relative">
            <div className="absolute top-4 right-4 z-[1000] bg-gray-900/80 p-3 rounded backdrop-blur-sm border border-gray-600 text-xs text-white shadow-lg pointer-events-none">
                <h4 className="font-bold mb-2">{viewMode === 'status' ? 'Sistem Durumu' : 'Bakım Sağlık Haritası'}</h4>
                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 rounded-full bg-blue-500"></div> İstasyon</div>
                {viewMode === 'status' ? (
                    <>
                        <div className="flex items-center gap-2 mb-1"><div className="w-6 h-1 bg-gray-500"></div> Çalışıyor</div>
                        <div className="flex items-center gap-2 mb-1"><div className="w-6 h-1 bg-yellow-400"></div> Optimize Rota</div>
                        <div className="flex items-center gap-2 mb-1"><div className="w-6 h-1 border-t-2 border-dashed border-red-500"></div> Kapalı Hat</div>
                        <div className="flex items-center gap-2"><div className="w-6 h-1 bg-orange-500"></div> Bakım / Uyarı</div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-1"><div className="w-6 h-1 bg-[#10B981]"></div> İyi (&gt;%80)</div>
                        <div className="flex items-center gap-2 mb-1"><div className="w-6 h-1 bg-[#F59E0B]"></div> Orta (%50-80)</div>
                        <div className="flex items-center gap-2"><div className="w-6 h-1 bg-[#EF4444]"></div> Kritik (&lt;%50)</div>
                    </>
                )}
            </div>

            <MapContainer
                center={[39.0, 35.0]}
                zoom={6}
                style={{ height: '100%', width: '100%', background: '#0f1419' }}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                <MapBounds network={network} />

                {railwayGeoJson?.features && (
                    <GeoJSON
                        data={
                        {
                            type: "FeatureCollection",
                            features: railwayGeoJson.features.filter(
                            (f: any) =>
                                f.geometry &&
                                (f.geometry.type === "LineString" ||
                                f.geometry.type === "MultiLineString")
                            ),
                        } as any
                        }
                        style={() => ({
                        color: "#2563eb",
                        weight: 4,
                        opacity: 0.8,
                        })}
                    />
                    )}

                    {basmaneMenemenGeoJson?.features && (
                    <GeoJSON
                        data={
                        {
                            type: "FeatureCollection",
                            features: basmaneMenemenGeoJson.features.filter(
                            (f: any) =>
                                f.geometry &&
                                (f.geometry.type === "LineString" ||
                                f.geometry.type === "MultiLineString")
                            ),
                        } as any
                        }
                        style={() => ({
                        color: "#2563eb",
                        weight: 4,
                        opacity: 0.8,
                        })}
                    />
                    )}

                {/* TRACKS */}
                {network.tracks.filter(track => !track.id.endsWith('-R')).map((track) => {
                    const source = network.stations.find(s => s.id === track.sourceStationId);
                    const target = network.stations.find(s => s.id === track.targetStationId);
                    if (!source || !target) return null;

                    const isRoute = routeTrackIds.has(track.id);
                    const isSelected = selectedTrackId === track.id;
                    const isClosed = track.status === 'closed';
                    const isMaintenance = track.status === 'maintenance';

                    // VISUAL OFFSET FOR PARALLEL TRACKS 🎨
                    // If multiple tracks exist between same stations, shift this one slightly
                    const isAlternative = track.id.includes('old');
                    const offset = isAlternative ? 0.002 : 0; // Tiny lat/lng shift

                    const positions: LatLngExpression[] = [
                        [source.coordinates.lat + offset, source.coordinates.lng + offset],
                        [target.coordinates.lat + offset, target.coordinates.lng + offset]
                    ];

                    const statusColor = isClosed ? '#EF4444' : (isMaintenance ? '#F59E0B' : (isRoute ? '#FACC15' : (isSelected ? '#3B82F6' : '#4B5563')));
                    const healthColor = getHealthColor(track.healthScore);

                    return (
                        <Polyline
                            key={track.id}
                            positions={positions}
                            eventHandlers={{
                                click: () => onSelectTrack && onSelectTrack(track.id)
                            }}
                            pathOptions={{
                                color: viewMode === 'maintenance' ? healthColor : statusColor,
                                weight: isRoute || isSelected ? 6 : (viewMode === 'maintenance' ? 4 : (isAlternative ? 1.5 : 3)),
                                opacity: isRoute || isSelected ? 1.0 : (isClosed ? 0.8 : 0.6),
                                dashArray: isClosed ? '10, 10' : undefined,
                            }}
                        >
                            <Popup>
                                <div className="text-black text-xs">
                                    <strong>Hat: {track.id}</strong><br />
                                    Ray Sağlığı: <span className={`font-bold ${track.healthScore < 50 ? 'text-red-600' : ''}`}>%{track.healthScore}</span><br />
                                    Toplam Yük: {(track.accumulatedTonnage / 1000000).toFixed(1)}M Ton<br />
                                    Son Denetim: {track.lastInspectionDate}<br />
                                    <hr className="my-1" />
                                    Durum: {track.status.toUpperCase()}
                                </div>
                            </Popup>
                        </Polyline>
                    );
                })}

                {/* STATIONS */}
                {network.stations.map((station) => (
                    <CircleMarker
                        key={station.id}
                        center={[station.coordinates.lat, station.coordinates.lng]}
                        pathOptions={{
                            color: activeRoute?.startStation === station.name ? '#3B82F6' :
                                activeRoute?.endStation === station.name ? '#10B981' : '#60A5FA',
                            fillColor: activeRoute?.startStation === station.name ? '#3B82F6' :
                                activeRoute?.endStation === station.name ? '#10B981' : '#1E3A8A',
                            fillOpacity: 1,
                            weight: 2
                        }}
                        radius={activeRoute?.startStation === station.name || activeRoute?.endStation === station.name ? 8 : 5}
                    >
                        <Popup>
                            <div className="text-black">
                                <strong>{station.name}</strong><br />
                                Kapasite: {station.capacity} Tren
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

            </MapContainer>
        </div>
    );
});
