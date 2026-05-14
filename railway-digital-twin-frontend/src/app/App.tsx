import { useState, useEffect, useCallback, useMemo } from "react";
import { TopNavbar } from "./components/TopNavbar";
import { Sidebar } from "./components/Sidebar";
import { KPICard } from "./components/KPICard";
import { GISMap } from "./components/GISMap";
import { MaintenanceDashboard } from "./components/MaintenanceDashboard";
import { SensorInsightPanel } from "./components/SensorInsightPanel";
import { OperationalAnalytics } from "./components/OperationalAnalytics";
import { SensorChart } from "./components/SensorChart";
import { AnomalyTimeline } from "./components/AnomalyTimeline";
import { ExplainableAIPanel } from "./components/ExplainableAIPanel";
import { EnergyRiskDashboard } from "./components/EnergyRiskDashboard";
import { GenerativeReportPanel } from "./components/GenerativeReportPanel";
import { RouteOptimizationPanel } from "./components/RouteOptimizationPanel";
import { anomalyService } from "../services/anomalyService";
import { energyRiskService } from "../services/energyRiskService";
import { DSSPanel } from "./components/DSSPanel";
import { dssService } from "../services/dssService";
import {
  Activity,
  AlertTriangle,
  Radio,
  Zap,
} from "lucide-react";
import { getRealNetwork } from "../utils/realData";
import { findShortestPath } from "../utils/algorithms/dijkstra";
import { RailwayNetwork } from "../types/Railway";
import { telemetryService } from "../services/telemetryService";

export default function App() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [selectedSensorSegment, setSelectedSensorSegment] = useState("S1");
  const [segmentSensorData, setSegmentSensorData] = useState<any[]>([]);
  const [sensorCount, setSensorCount] = useState<number>(0);
  const [network, setNetwork] = useState<RailwayNetwork | null>(null);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [trainLoad, setTrainLoad] = useState<number>(400);
  const [startStation, setStartStation] = useState<string>("izm-c");
  const [endStation, setEndStation] = useState<string>("ban");
  const [mapMode, setMapMode] = useState<"status" | "maintenance">("status");
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  const [energyRiskResults, setEnergyRiskResults] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>("engineer");
  const [telemetryLoading, setTelemetryLoading] = useState<boolean>(false);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);
  const [initialTelemetryLoaded, setInitialTelemetryLoaded] = useState<boolean>(false);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [dssOverview, setDssOverview] = useState<any>(null);
  const [dssRouteReport, setDssRouteReport] = useState<any>(null);

  // Stable callback reference — prevents GISMap from re-rendering on every parent state change
  const handleSelectTrack = useCallback((id: string) => setSelectedTrackId(id), []);
  const handleSetMapMode = useCallback((mode: 'status' | 'maintenance') => setMapMode(mode), []);
  const handleSetUserRole = useCallback((role: string) => setUserRole(role), []);
  const handleSetActiveSection = useCallback((section: string) => setActiveSection(section), []);
  const handleSetStartStation = useCallback((s: string) => setStartStation(s), []);
  const handleSetEndStation = useCallback((s: string) => setEndStation(s), []);
  const handleSetTrainLoad = useCallback((n: number) => setTrainLoad(n), []);

  const memoizedRouteResult = useMemo(() => routeResult, [JSON.stringify(routeResult)]);
  

  useEffect(() => {
    setNetwork(getRealNetwork());
  }, []);

  useEffect(() => {
    if (!network || startStation === endStation) {
      setRouteResult(null);
      return;
    }

    const result = findShortestPath(network, startStation, endStation, trainLoad);

    setRouteResult({
      startStation: network.stations.find((s) => s.id === startStation)?.name,
      endStation: network.stations.find((s) => s.id === endStation)?.name,
      result,
    });
  }, [network, startStation, endStation, trainLoad]);

  useEffect(() => {
  let isFirstLoad = true;

  const fetchData = async () => {
    if (isFirstLoad) {
      setTelemetryLoading(true);
    }

    setTelemetryError(null);

    try {
      const readings = await telemetryService.getLatestTelemetry(120);

      if (readings && readings.length > 0) {
        const bySegment: Record<string, Record<string, number | string>> = {};

        for (const r of readings) {
          if (!bySegment[r.segmentId]) {
            bySegment[r.segmentId] = {
              segmentId: r.segmentId,
              timestamp: r.recordedAt,
            };
          }

          bySegment[r.segmentId][r.channelName] = r.value;
        }

        const latestSegments = Object.values(bySegment) as any[];

        const backendEnergyRiskResults = await energyRiskService.getCurrentEnergyRisks();
        setEnergyRiskResults(backendEnergyRiskResults);

        const chartData = latestSegments
          .slice(0, 20)
          .reverse()
          .map((seg: any) => ({
            time: new Date(seg.timestamp).toLocaleTimeString("tr-TR", {
              timeZone: "Europe/Istanbul",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            temperature: seg["ray_temperature"] ?? 0,
            vibration: seg["ray_vibration_x"] ?? 0,
            tilt: seg["rail_slope"] ?? 0,
            trainTemp: seg["train_temperature"] ?? 0,
            speed: seg["train_speed"] ?? 0,
            trainVib: seg["train_vibration_x"] ?? 0,
          }));

        setSensorData(chartData);

        const uniqueSensorIds = new Set(readings.map((r) => r.sensorId));
        setSensorCount(uniqueSensorIds.size);

        const backendAnomalies = await anomalyService.getLatestAnomalies(20);
        const backendAnomalyResults = await anomalyService.getLatestAnomalyResults();

        const formattedAnomalies = backendAnomalies.map((a) => ({
          time: new Date(a.detectedTime).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: a.anomalyType,
          severity: a.severity === "HIGH" ? "yüksek" : "orta",
          location: `${a.segmentId} - ${a.segmentName}`,
          value: `${Number(a.measuredValue).toFixed(2)} / threshold: ${a.thresholdValue}`,
          status: "aktif" as const,
          description: a.description,
        }));

        const formattedAiAnomalies = backendAnomalyResults
        .filter((a) => a.isAnomaly)
        .slice(0, 20)
        .map((a) => ({
          time: new Date(a.detectedAt).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: `AI Anomaly (${a.modelType})`,
          severity:
            a.severity === "HIGH"
              ? "yüksek"
              : a.severity === "MEDIUM"
                ? "orta"
                : "düşük",
          location: `Segment ${a.segmentId}`,
          value: `Score: ${Number(a.anomalyScore).toFixed(2)}`,
          status: "aktif",
          description: a.xaiExplanation,
        }));

        const newDetectedAnomalies: any[] = [];

        for (const latest of latestSegments) {
          const time = new Date(latest.timestamp).toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          });

          if (Number(latest["ray_temperature"]) > 40) {
            newDetectedAnomalies.push({
              time,
              type: "Kritik Sıcaklık",
              severity: "yüksek",
              location: `Segment ${latest.segmentId}`,
              value: `${Number(latest["ray_temperature"]).toFixed(1)}°C`,
              status: "aktif",
            });
          }

          if (Number(latest["train_speed"]) > 85) {
            newDetectedAnomalies.push({
              time,
              type: "Aşırı Hız Limit Aşımı",
              severity: "orta",
              location: `Segment ${latest.segmentId}`,
              value: `${Number(latest["train_speed"]).toFixed(1)} km/h`,
              status: "aktif",
            });
          }

          if (Number(latest["ray_vibration_x"]) > 2.5) {
            newDetectedAnomalies.push({
              time,
              type: "Yüksek Ray Titreşimi",
              severity: "yüksek",
              location: `Segment ${latest.segmentId}`,
              value: `${Number(latest["ray_vibration_x"]).toFixed(2)} Hz`,
              status: "aktif",
            });
          }

          if (Math.abs(Number(latest["rail_slope"] ?? 0)) > 3) {
            newDetectedAnomalies.push({
              time,
              type: "Hatalı Ray Eğimi",
              severity: "orta",
              location: `Segment ${latest.segmentId}`,
              value: `${Number(latest["rail_slope"]).toFixed(1)}°`,
              status: "izleniyor",
            });
          }
        }

        setAnomalies((prev) => {
          const combined = [
          ...newDetectedAnomalies,
          ...formattedAnomalies,
          ...formattedAiAnomalies,
          ...prev,
        ];

          const unique = combined.filter(
            (item, index, self) =>
              index ===
              self.findIndex(
                (other) =>
                  other.time === item.time &&
                  other.type === item.type &&
                  other.location === item.location
              )
          );

          return unique.slice(0, 20);
        });

        setNetwork((prevNetwork) => {
          if (!prevNetwork) return null;

          const newTracks = prevNetwork.tracks.map((track) => {
            const segmentId = track.id.replace("-R", "");
            const segmentData = bySegment[segmentId];

            if (!segmentData) return track;

            let health = 95;

            if (
              Number(segmentData["ray_temperature"]) > 40 ||
              Number(segmentData["ray_vibration_x"]) > 2.5
            ) {
              health = 40;
            } else if (
              Number(segmentData["train_speed"]) > 85 ||
              Math.abs(Number(segmentData["rail_slope"] ?? 0)) > 3
            ) {
              health = 70;
            }

            return {
              ...track,
              healthScore: health,
            };
          });

          return {
            ...prevNetwork,
            tracks: newTracks,
          };
        });
      }

    
    } catch (error) {
      setTelemetryError(
        "Gerçek zamanlı telemetri verisi yüklenirken bir hata oluştu. Lütfen sunucu bağlantınızı kontrol edin."
      );
      console.error(error);
    } finally {
      if (isFirstLoad) {
        setTelemetryLoading(false);
        isFirstLoad = false;
      }

      setInitialTelemetryLoaded(true);
    }
  };

    fetchData();
    // Poll every 10s instead of 3s — reduces unnecessary re-renders
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSegmentTelemetry = async () => {
      try {
        const readings = await telemetryService.getTelemetryBySegment(
          selectedSensorSegment,
          120
        );

        const grouped: Record<string, any> = {};

        for (const r of readings) {
          const timeKey = r.recordedAt;

          const channel = (r.channelName || "")
            .toLowerCase()
            .replace(/_/g, "");

          if (!grouped[timeKey]) {
            grouped[timeKey] = {
              rawTime: r.recordedAt,
              time: new Date(r.recordedAt).toLocaleTimeString("tr-TR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
              temperature: null,
              vibration: null,
              tilt: null,
              trainTemp: null,
              speed: null,
              trainVib: null,
            };
          }

          if (channel === "temperature" || channel === "traintemperature") {
            grouped[timeKey].temperature = r.value;
          }

          if (channel === "vibrationx" || channel === "trainvibrationx") {
            grouped[timeKey].vibration = r.value;
          }

          if (channel === "tilt" || channel === "railslope") {
            grouped[timeKey].tilt = r.value;
          }

          if (channel === "traintemperature") {
            grouped[timeKey].trainTemp = r.value;
          }

          if (channel === "trainspeed") {
            grouped[timeKey].speed = r.value;
          }

          if (channel === "trainvibrationx") {
            grouped[timeKey].trainVib = r.value;
          }
        }

        const chartData = Object.values(grouped)
          .sort((a: any, b: any) => a.rawTime.localeCompare(b.rawTime))
          .slice(-6)
          .map((item: any) => {
            const { rawTime, ...rest } = item;
            return rest;
          });

        setSegmentSensorData(chartData);
      } catch (error) {
        console.error("Segment telemetry could not be loaded:", error);
        setSegmentSensorData([]);
      }
    };

    fetchSegmentTelemetry();

    const interval = setInterval(fetchSegmentTelemetry, 3000);

    return () => clearInterval(interval);
  }, [selectedSensorSegment]);

  useEffect(() => {
    const fetchDssData = async () => {
      try {
        const overview = await dssService.getOverview();
        const routeReport = await dssService.getRouteReport();

        setDssOverview(overview);
        setDssRouteReport(routeReport);
      } catch (error) {
        console.error("DSS data could not be loaded:", error);
      }
    };

    fetchDssData();

    const interval = setInterval(fetchDssData, 10000);

    return () => clearInterval(interval);
  }, []);

  const simulateTrackWear = useCallback(() => {
    setNetwork(prev => {
      if (!prev) return null;

      return {
        ...prev,
        tracks: prev.tracks.map((t) => ({
          ...t,
          healthScore: Math.max(10, t.healthScore - (Math.random() > 0.7 ? 2 : 0)),
          accumulatedTonnage: t.accumulatedTonnage + Math.random() * 50000,
        })),
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col">
      <TopNavbar userRole={userRole} setUserRole={handleSetUserRole} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSetActiveSection}
          userRole={userRole}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {telemetryLoading && (
            <div className="mb-6 rounded-xl border border-blue-500/40 bg-blue-500/10 p-4 text-blue-100">
              Gerçek zamanlı telemetri verisi yükleniyor... Lütfen bekleyin.
            </div>
          )}

          {telemetryError && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-100">
              {telemetryError}
            </div>
          )}

          {activeSection === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Aktif Sensörler" value={sensorCount} icon={Radio} color="blue" />
                <KPICard
                  title="Tespit Edilen Anomaliler"
                  value={anomalies.length}
                  icon={AlertTriangle}
                  color="red"
                />
                <KPICard
                  title="Yüksek Riskli Segmentler"
                  value={network?.tracks.filter((t) => t.healthScore < 50).length || 0}
                  icon={Activity}
                  color="yellow"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSetMapMode("status")}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold border ${
                          mapMode === "status"
                            ? "bg-blue-600 border-blue-400 text-white"
                            : "bg-gray-900 border-gray-700 text-gray-400"
                        }`}
                      >
                        OPERASYONEL DURUM
                      </button>

                      <button
                        onClick={() => handleSetMapMode("maintenance")}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold border ${
                          mapMode === "maintenance"
                            ? "bg-yellow-600 border-yellow-400 text-white"
                            : "bg-gray-900 border-gray-700 text-gray-400"
                        }`}
                      >
                        BAKIM HARİTASI
                      </button>
                    </div>

                    <button
                      onClick={simulateTrackWear}
                      className="px-4 py-1.5 bg-purple-600 border border-purple-400 text-white rounded-md text-xs font-bold shadow-lg shadow-purple-500/20"
                    >
                      ZAMANI HIZLANDIR
                    </button>
                  </div>

                  <div className="border border-gray-700 rounded-lg overflow-hidden h-[500px] shadow-2xl bg-gray-900/40">
                    <GISMap
                      network={network}
                      activeRoute={memoizedRouteResult}
                      viewMode={mapMode}
                      selectedTrackId={selectedTrackId}
                      onSelectTrack={handleSelectTrack}
                      dssOverview={dssOverview}
                    />
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <MaintenanceDashboard network={network} />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <SensorInsightPanel
                  track={network?.tracks.find((t) => t.id === selectedTrackId) || null}
                />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <AnomalyTimeline anomalies={anomalies} />
              </div>

              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-xl">
                <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2">
                  <Zap className="text-yellow-400 w-5 h-5" /> Lojistik Simülatörü
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="space-y-2">
                    <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block">
                      Başlangıç İstasyonu
                    </label>

                    <select
                      className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700"
                      value={startStation}
                      onChange={(e) => handleSetStartStation(e.target.value)}
                    >
                      {network?.stations.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block">
                      Hedef İstasyon
                    </label>

                    <select
                      className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700"
                      value={endStation}
                      onChange={(e) => handleSetEndStation(e.target.value)}
                    >
                      {network?.stations.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between mb-2">
                      <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block">
                        Tren Yükü
                      </label>
                      <span className="text-yellow-400 font-bold text-sm font-mono">
                        {trainLoad} Ton
                      </span>
                    </div>

                    <input
                      type="range"
                      min="100"
                      max="1500"
                      step="50"
                      value={trainLoad}
                      onChange={(e) => handleSetTrainLoad(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-700/50 pt-8">
                  <OperationalAnalytics routeResult={routeResult} trainLoad={trainLoad} />
                </div>

                <div className="border-t border-gray-700/50 pt-8 mt-8">
                  <RouteOptimizationPanel />
                </div>
              </div>
            </div>
          )}

          {activeSection === "dss" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">
                Karar Destek Sistemi
              </h2>

              <DSSPanel overview={dssOverview} routeReport={dssRouteReport} />

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
                <h3 className="text-white text-lg font-bold mb-4">
                  Segment Bazlı DSS Analizi
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dssOverview?.segmentReports?.map((segment: any) => (
                    <div
                      key={segment.segmentId}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-bold">{segment.segmentId}</h4>

                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold ${
                            segment.severity === "CRITICAL"
                              ? "bg-red-500/20 text-red-400"
                              : segment.severity === "WARNING"
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-green-500/20 text-green-400"
                          }`}
                        >
                          {segment.severity}
                        </span>
                      </div>

                      <p className="text-gray-400 text-sm">
                        Risk Skoru:
                        <span className="text-white ml-2">{segment.riskScore}</span>
                      </p>

                      <p className="text-gray-400 text-sm">
                        Enerji Etkisi:
                        <span className="text-white ml-2">
                          {segment.estimatedEnergyImpact}
                        </span>
                      </p>

                      <p className="text-gray-500 text-xs leading-relaxed mt-3">
                        {segment.executiveSummary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "sensors" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">Canlı Sensör İzleme Ağı</h2>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6 flex items-center gap-4">
                <label className="text-gray-300 font-medium">Segment Seç:</label>

                <select
                  value={selectedSensorSegment}
                  onChange={(e) => setSelectedSensorSegment(e.target.value)}
                  className="bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2"
                >
                  <option value="S1">S1 - Izmir - Manisa</option>
                  <option value="S2">S2 - Manisa - Akhisar</option>
                  <option value="S3">S3 - Akhisar - Soma</option>
                  <option value="S4">S4 - Soma - Balikesir</option>
                  <option value="S5">S5 - Balikesir - Susurluk</option>
                  <option value="S6">S6 - Susurluk - Bandirma</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SensorChart title="Ray Sıcaklığı" dataKey="temperature" color="#ef4444" data={segmentSensorData} unit="°C" />
                <SensorChart title="Ray Titreşimi" dataKey="vibration" color="#3b82f6" data={segmentSensorData} unit=" Hz" />
                <SensorChart title="Hat Eğimi" dataKey="tilt" color="#10b981" data={segmentSensorData} unit="°" />
                <SensorChart title="Vagon Sıcaklığı" dataKey="trainTemp" color="#f59e0b" data={segmentSensorData} unit="°C" />
                <SensorChart title="Tren Hızı" dataKey="speed" color="#8b5cf6" data={segmentSensorData} unit=" km/h" />
                <SensorChart title="Vagon Titreşimi" dataKey="trainVib" color="#ec4899" data={segmentSensorData} unit=" Hz" />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 shadow-lg">
                  <h3 className="text-white mb-6 font-bold flex items-center gap-2">
                    <Activity className="text-green-400 w-5 h-5" /> Sensör Ağı Sağlık Durumu
                  </h3>

                  <div className="space-y-5">
                    {[
                      { label: "Sıcaklık Sensörleri", status: "87/90 Aktif", color: "green" },
                      { label: "Titreşim Sensörleri", status: "82/85 Aktif", color: "green" },
                      { label: "Eğim Sensörleri", status: "70/72 Aktif", color: "yellow" },
                      { label: "Basınç Sensörleri", status: "8/10 Aktif", color: "red" },
                    ].map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-700/50"
                      >
                        <span className="text-gray-300 font-medium">{s.label}</span>
                        <span className={`text-${s.color}-400 font-bold font-mono`}>
                          {s.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "anomaly" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">
                Gerçek Zamanlı Anomali Tespiti
              </h2>

              <AnomalyTimeline anomalies={anomalies} />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Toplam Anomaliler" value={anomalies.length} icon={AlertTriangle} color="red" />
                <KPICard
                  title="Kritik Uyarılar"
                  value={anomalies.filter((a) => a.severity === "yüksek").length}
                  icon={AlertTriangle}
                  color="yellow"
                />
                <KPICard
                  title="İzlenen Segmentler"
                  value={sensorCount > 0 ? 6 : 0}
                  icon={Activity}
                  color="green"
                />
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl mt-6">
                <h3 className="text-white text-lg font-bold mb-4">Enerji & Risk Analizi</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {energyRiskResults.map((item) => (
                    <div key={item.segmentId} className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                      <div className="text-white font-bold mb-2">
                        {item.segmentId} - {item.segmentName}
                      </div>

                      <div className="text-gray-400 text-sm">
                        Enerji Skoru: <span className="text-blue-400">{item.energyScore}</span>
                      </div>

                      <div className="text-gray-400 text-sm">
                        Risk Skoru: <span className="text-yellow-400">{item.riskScore}</span>
                      </div>

                      <div className="text-gray-400 text-sm">
                        Risk Seviyesi: <span className="text-red-400">{item.riskLevel}</span>
                      </div>

                      <p className="text-gray-500 text-xs mt-3">{item.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === "route-comparison" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">
                Rota Karşılaştırma ve Optimizasyon
              </h2>
              <RouteOptimizationPanel />
            </div>
          )}

          {activeSection === "maintenance" && (
            <div className="space-y-8">
              <h2 className="text-white text-2xl font-bold mb-4">
                Öngörülü Bakım ve RUL Analizi
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(network?.tracks ?? [])
                  .filter(
                    (t, _, arr) =>
                      !t.id.endsWith("-R") ||
                      !arr.some((x) => x.id === t.id.replace("-R", ""))
                  )
                  .sort((a, b) => a.healthScore - b.healthScore)
                  .slice(0, 3)
                  .map((track) => {
                    const rul = Math.max(3, Math.round((track.healthScore - 20) * 1.8));
                    const color =
                      track.healthScore < 50
                        ? "red"
                        : track.healthScore < 80
                          ? "yellow"
                          : "green";

                    const warning =
                      track.healthScore < 50
                        ? "⚠️ Kritik: Acil bakım gerekli"
                        : track.healthScore < 80
                          ? `Öneri: ${Math.round(rul * 0.6)} gün içinde muayene`
                          : "✓ İyi durum - Düzenli izleme";

                    return (
                      <div
                        key={track.id}
                        className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl"
                      >
                        <h3 className="text-white text-lg font-bold mb-4">{track.id} Hattı</h3>

                        <div className={`text-${color}-400 text-4xl font-bold mb-2`}>
                          {rul} gün
                        </div>

                        <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider">
                          Kalan Yararlı Ömür (RUL)
                        </p>

                        <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
                          <div
                            className={`bg-${color}-500 h-3 rounded-full shadow-lg`}
                            style={{ width: `${track.healthScore}%` }}
                          ></div>
                        </div>

                        <div
                          className={`text-sm font-medium ${
                            track.healthScore < 50 ? "text-red-400" : "text-gray-400"
                          }`}
                        >
                          {warning}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <MaintenanceDashboard network={network} />
            </div>
          )}

          {activeSection === "energy-risk" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">Enerji & Risk Analizi</h2>
              <EnergyRiskDashboard energyRiskResults={energyRiskResults} />
            </div>
          )}

          {activeSection === "xai" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">Açıklanabilir AI Analiz</h2>
              <ExplainableAIPanel />
            </div>
          )}

          {activeSection === "reports" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">Generatif AI Raporları</h2>
              <GenerativeReportPanel />
            </div>
          )}

          {activeSection === "settings" && (
            <div className="max-w-2xl space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">Sistem Yapılandırması</h2>

              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 space-y-6">
                <div className="flex items-center justify-between p-5 bg-gray-900/50 rounded-xl border border-gray-700 shadow-inner">
                  <span className="text-gray-300 font-medium">IoT Veri Akış Hızı</span>
                  <span className="text-blue-400 font-mono font-bold">3 Saniye</span>
                </div>

                <div className="flex items-center justify-between p-5 bg-gray-900/50 rounded-xl border border-gray-700 shadow-inner">
                  <span className="text-gray-300 font-medium">Kritik Anomali Eşiği</span>
                  <span className="text-red-400 font-mono font-bold">65°C / 8g</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}