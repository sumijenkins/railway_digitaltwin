import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, useMap, GeoJSON, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { RailwayNetwork, Track } from '../../types/Railway';
import { useEffect, memo, useRef, useState } from 'react';
import { LatLngExpression } from 'leaflet';
import { useRailwayPath } from "../../hooks/useRailwayPath";
import { useTrainAnimation } from "../../hooks/useTrainAnimation";


interface GISMapProps {
    network: RailwayNetwork | null;
    trains?: any[];
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
    dssOverview?: any;
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

export function GISMap({ network, trains, activeRoute, viewMode = 'status', selectedTrackId, onSelectTrack, dssOverview }: GISMapProps) {
    const [railwayGeoJson, setRailwayGeoJson] = useState<any>(null);
    const [basmaneMenemenGeoJson, setBasmaneMenemenGeoJson] = useState<any>(null);
    const [manisaUsakGeoJson, setManisaUsakGeoJson] = useState<any>(null);
    const [usakAfyonGeoJson, setUsakAfyonGeoJson] = useState<any>(null);
    const [afyonEskisehirGeoJson, setAfyonEskisehirGeoJson] = useState<any>(null);
    const [eskisehirAnkaraGeoJson, setEskisehirAnkaraGeoJson] = useState<any>(null);
    const [istanbulGebzeGeoJson, setIstanbulGebzeGeoJson] = useState<any>(null);
    const [gebzeIzmitGeoJson, setGebzeIzmitGeoJson] = useState<any>(null);
    const [izmitArifiyeGeoJson, setIzmitArifiyeGeoJson] = useState<any>(null);
    const [arifiyeBilecikGeoJson, setArifiyeBilecikGeoJson] = useState<any>(null);
    const [bilecikEskisehirGeoJson, setBilecikEskisehirGeoJson] = useState<any>(null);
    const [balikesirKutahyaGeoJson, setBalikesirKutahyaGeoJson] = useState<any>(null);

    useEffect(() => {
        fetch("/data/menemen-bandirma-railway.geojson")
            .then((res) => res.json())
            .then((data) => setRailwayGeoJson(data))
            .catch((err) => console.error("GeoJSON could not be loaded:", err));

        fetch("/data/basmane-menemen-railway.geojson")
            .then((res) => res.json())
            .then((data) => setBasmaneMenemenGeoJson(data))
            .catch((err) => console.error("Basmane-Menemen GeoJSON could not be loaded:", err));

        fetch("/data/manisa-usak-railway.geojson")
        .then((res) => res.json())
        .then((data) => setManisaUsakGeoJson(data))
        .catch((err) => console.error("Manisa-Uşak GeoJSON could not be loaded:", err));

        fetch("/data/usak-afyon-railway.geojson")
            .then((res) => res.json())
            .then((data) => setUsakAfyonGeoJson(data))
            .catch((err) => console.error("Uşak-Afyon GeoJSON could not be loaded:", err));

        fetch("/data/afyon-eskisehir-railway.geojson")
            .then((res) => res.json())
            .then((data) => setAfyonEskisehirGeoJson(data))
            .catch((err) => console.error("Afyon-Eskişehir GeoJSON could not be loaded:", err));

        fetch("/data/eskisehir-ankara-railway.geojson")
            .then((res) => res.json())
            .then((data) => setEskisehirAnkaraGeoJson(data))
            .catch((err) => console.error("Eskişehir-Ankara GeoJSON could not be loaded:", err));

        fetch("/data/istanbul-gebze-railway.geojson")
            .then((res) => res.json())
            .then((data) => setIstanbulGebzeGeoJson(data));

        fetch("/data/gebze-izmit-railway.geojson")
            .then((res) => res.json())
            .then((data) => setGebzeIzmitGeoJson(data));

        fetch("/data/izmit-arifiye-railway.geojson")
            .then((res) => res.json())
            .then((data) => setIzmitArifiyeGeoJson(data));

        fetch("/data/arifiye-bilecik-railway.geojson")
            .then((res) => res.json())
            .then((data) => setArifiyeBilecikGeoJson(data));

        fetch("/data/bilecik-eskisehir-railway.geojson")
            .then((res) => res.json())
            .then((data) => setBilecikEskisehirGeoJson(data));
        
            fetch("/data/balikesir_kutahya.geojson")
            .then((res) => res.json())
            .then((data) => setBalikesirKutahyaGeoJson(data))
            .catch((err) => console.error("Balikesir-Kütahya GeoJSON could not be loaded:", err));
        
    }, []);

    const railwayCoords = useRailwayPath();
    const { trainB } = useTrainAnimation(railwayCoords, 21600000); // 6 Saatlik gerçek zamanlı rota

    if (!network) return <div className="text-white">Harita verisi bekleniyor...</div>;

    const routeTrackIds = new Set(activeRoute?.result?.path.map(t => t.id) || []);

    const dssSegmentMap = new Map(
        dssOverview?.segmentReports?.map((report: any) => [
            report.segmentId,
            report
        ]) || []
    );

    const getDssColor = (segmentId: string) => {
        const report = dssSegmentMap.get(segmentId) as any;

        if (!report) {
            return "#4B5563";
        }

        if (report.severity === "CRITICAL") {
            return "#EF4444"; // red
        }

        if (report.severity === "WARNING") {
            return "#FACC15"; // yellow
        }

        return "#10B981"; // green
    };

    const getHealthColor = (score: number) => {
        if (score > 80) return '#10B981'; // Green
        if (score > 50) return '#F59E0B'; // Yellow/Orange
        return '#EF4444'; // Red
    };

    const renderRailwayGeoJson = (geoJsonData: any) => {
        if (!geoJsonData?.features) return null;

        return (
            <GeoJSON
                data={{
                    type: "FeatureCollection",
                    features: geoJsonData.features.filter(
                        (f: any) =>
                            f.geometry &&
                            (
                                f.geometry.type === "LineString" ||
                                f.geometry.type === "MultiLineString"
                            )
                    ),
                } as any}
                style={() => ({
                    color: "#2563eb",
                    weight: 4,
                    opacity: 0.8,
                })}
            />
        );
    };

    if (!network) return <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white">Harita verisi yükleniyor...</div>;

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

                {renderRailwayGeoJson(manisaUsakGeoJson)}
                {renderRailwayGeoJson(usakAfyonGeoJson)}
                {renderRailwayGeoJson(afyonEskisehirGeoJson)}
                {renderRailwayGeoJson(eskisehirAnkaraGeoJson)}
                {renderRailwayGeoJson(istanbulGebzeGeoJson)}
                {renderRailwayGeoJson(gebzeIzmitGeoJson)}
                {renderRailwayGeoJson(izmitArifiyeGeoJson)}
                {renderRailwayGeoJson(arifiyeBilecikGeoJson)}
                {renderRailwayGeoJson(bilecikEskisehirGeoJson)}
                {renderRailwayGeoJson(balikesirKutahyaGeoJson)}


                {/* Animated trains moved to end for better visibility */}

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
                {/* {network.tracks.filter(track => !track.id.endsWith('-R')).map((track) => {
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

                    const segmentId = track.id.replace("-R", "").replace("-old", "");

                    const dssColor = getDssColor(segmentId);

                    const statusColor = isClosed
                        ? "#EF4444"
                        : isMaintenance
                            ? "#F59E0B"
                            : isRoute
                                ? "#FACC15"
                                : isSelected
                                    ? "#3B82F6"
                                    : dssColor;
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
                                    DSS Durumu: {(dssSegmentMap.get(segmentId) as any)?.severity ?? "UNKNOWN"}<br />
                                    Risk Skoru: {(dssSegmentMap.get(segmentId) as any)?.riskScore ?? "-"}<br />
                                    <hr className="my-1" />
                                    Durum: {track.status.toUpperCase()}
                                </div>
                            </Popup>
                        </Polyline> */}
                    {/* );
                })} */}

                {/* STATIONS */}
                
                {network.stations.map(station => (
                    <CircleMarker
                        key={station.id}
                        center={[station.coordinates.lat, station.coordinates.lng]}
                        radius={6}
                        pathOptions={{
                            color: '#3B82F6',
                            fillColor: '#3B82F6',
                            fillOpacity: 1
                        }}
                    >
                        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                            {
                                network.tracks
                                    .filter(
                                        t =>
                                            !t.id.endsWith("-R") &&
                                            (
                                                t.sourceStationId === station.id ||
                                                t.targetStationId === station.id
                                            )
                                    )
                                    .map(t => t.id)
                                    .join(" / ")
                            }
                        </Tooltip>
                    </CircleMarker>
                ))}

                {railwayCoords.length > 0 && (
                    <CircleMarker
                        center={[trainB.lat, trainB.lng]}
                        pathOptions={{ color: '#fff', fillColor: '#3b82f6', fillOpacity: 1, weight: 2 }}
                        radius={8}
                    >
                        <Popup>
                            <div className="text-black text-xs">
                                <div className="font-bold">Tren B — Bandırma → Basmane</div>
                                <div className="font-mono">{trainB.lat.toFixed(4)}, {trainB.lng.toFixed(4)}</div>
                            </div>
                        </Popup>
                    </CircleMarker>
                )}

            </MapContainer>
        </div>
    );
}