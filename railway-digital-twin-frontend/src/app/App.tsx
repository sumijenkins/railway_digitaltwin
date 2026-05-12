import { useState, useEffect } from "react";
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
import { TrackDetailPage } from "./components/TrackDetailPage";
import { TrainDetailPage } from "./components/TrainDetailPage";
import { anomalyService } from "../services/anomalyService";
import { energyRiskService } from "../services/energyRiskService";
import {
  Activity,
  AlertTriangle,
  Radio,
  Zap,
} from "lucide-react";
import { getRealNetwork } from "../utils/realData";
import { findShortestPath } from "../utils/algorithms/dijkstra";
import { RailwayNetwork, Train } from "../types/Railway";
import { telemetryService } from "../services/telemetryService";

export default function App() {
  const [activeSection, setActiveSection] = useState("overview");
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [sensorCount, setSensorCount] = useState<number>(0);
  const [network, setNetwork] = useState<RailwayNetwork | null>(null);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [trainLoad, setTrainLoad] = useState<number>(400);
  const [startStation, setStartStation] = useState<string>('izm-c');
  const [endStation, setEndStation] = useState<string>('ban');
  const [mapMode, setMapMode] = useState<'status' | 'maintenance'>('status');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('engineer');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState<boolean>(false);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);
  const [selectedTrainId, setSelectedTrainId] = useState<string | null>(null);
  const [trains] = useState<Train[]>([
    {
      id: "T-01",
      name: "Yük Treni 27",
      maxLoad: 1500,
      totalLoad: 1340,
      currentStationId: "izm-c",
      destinationStationId: "ban",
    },
    {
      id: "T-02",
      name: "Yük Treni 54",
      maxLoad: 1400,
      totalLoad: 970,
      currentStationId: "man",
      destinationStationId: "akh",
    },
  ]);
  const [energyRiskResults, setEnergyRiskResults] = useState<any[]>([]);
  const selectedTrack = network?.tracks.find((track) => track.id === selectedTrackId) || null;
  const selectedTrain = trains.find((train) => train.id === selectedTrainId) || null;

  const handleSelectTrain = (trainId: string) => {
    setSelectedTrainId(trainId);
    setActiveSection("train-detail");
  };

  // Load Network Once
  useEffect(() => {
    setNetwork(getRealNetwork());
  }, []);

  // Run Optimization
  useEffect(() => {
    if (!network || startStation === endStation) {
      setRouteResult(null);
      return;
    }
    const result = findShortestPath(network, startStation, endStation, trainLoad);
    setRouteResult({
      startStation: network.stations.find(s => s.id === startStation)?.name,
      endStation: network.stations.find(s => s.id === endStation)?.name,
      result
    });
  }, [network, startStation, endStation, trainLoad]);

  const [anomalies, setAnomalies] = useState<any[]>([]);

  // Fetch real-time telemetry from PostgreSQL
  useEffect(() => {
    const fetchData = async () => {
      setTelemetryLoading(true);
      setTelemetryError(null);

      try {
        const readings = await telemetryService.getLatestTelemetry(120);
        if (readings && readings.length > 0) {

          // 1. Normalize kayıtları (segment + zaman) bazında grupla
          //    Her segment için en son okunan channelName → value eşleşmesini bul
          const bySegment: Record<string, Record<string, number | string>> = {};
          for (const r of readings) {
            if (!bySegment[r.segmentId]) {
              bySegment[r.segmentId] = { segmentId: r.segmentId, timestamp: r.recordedAt };
            }
            // channelName key olarak kullan (ray_temperature, train_speed, ...)
            bySegment[r.segmentId][r.channelName] = r.value;
          }

        // 2. Her segment → grafik data noktasına dönüştür
        const chartData = Object.values(bySegment)
          .slice(0, 20)
          .reverse()
          .map((seg: any) => ({
            time: new Date(seg.timestamp).toLocaleTimeString('tr-TR', {
              hour: '2-digit', minute: '2-digit', second: '2-digit'
            }),
            temperature:  seg['ray_temperature']   ?? 0,
            vibration:    seg['ray_vibration_x']   ?? 0,
            tilt:         seg['rail_slope']         ?? 0,
            trainTemp:    seg['train_temperature']  ?? 0,
            speed:        seg['train_speed']        ?? 0,
            trainVib:     seg['train_vibration_x']  ?? 0,
          }));
        setSensorData(chartData);

        // Unique sensor sayısını DB'den türet
        const uniqueSensorIds = new Set(readings.map(r => r.sensorId));
        setSensorCount(uniqueSensorIds.size);

        // 3. Anomali tespiti — en son gelen segment verisini kullan
        const latestSegments = Object.values(bySegment) as any[];
        const newDetectedAnomalies: any[] = [];

        for (const latest of latestSegments) {
          const time = new Date(latest.timestamp).toLocaleTimeString('tr-TR', {
            hour: '2-digit', minute: '2-digit'
          });

          if (latest['ray_temperature'] > 40) {
            newDetectedAnomalies.push({
              time,
              type: "Kritik Sıcaklık",
              severity: "yüksek",
              location: `Segment ${latest.segmentId}`,
              value: `${Number(latest['ray_temperature']).toFixed(1)}°C`,
              status: "aktif"
            });
          }

          if (latest['train_speed'] > 85) {
            newDetectedAnomalies.push({
              time,
              type: "Aşırı Hız Limit Aşımı",
              severity: "orta",
              location: `Segment ${latest.segmentId}`,
              value: `${Number(latest['train_speed']).toFixed(1)} km/h`,
              status: "aktif"
            });
          }

          if (latest['ray_vibration_x'] > 2.5) {
            newDetectedAnomalies.push({
              time,
              type: "Yüksek Ray Titreşimi",
              severity: "yüksek",
              location: `Segment ${latest.segmentId}`,
              value: `${Number(latest['ray_vibration_x']).toFixed(2)} Hz`,
              status: "aktif"
            });
          }

          if (Math.abs(latest['rail_slope'] ?? 0) > 3) {
            newDetectedAnomalies.push({
              time,
              type: "Hatalı Ray Eğimi",
              severity: "orta",
              location: `Segment ${latest.segmentId}`,
              value: `${Number(latest['rail_slope']).toFixed(1)}°`,
              status: "izleniyor"
            });
          }
        }

        if (newDetectedAnomalies.length > 0) {
          setAnomalies(prev => {
            const filtered = newDetectedAnomalies.filter(newA =>
              !prev.some(oldA => oldA.time === newA.time && oldA.type === newA.type)
            );
            return [...filtered, ...prev].slice(0, 10);
          });
        }

        // 4. Update track health scores dynamically
        setNetwork(prevNetwork => {
          if (!prevNetwork) return null;
          const newTracks = prevNetwork.tracks.map(track => {
            // Remove '-R' to match the base segment ID for reverse tracks
            const segmentId = track.id.replace('-R', '');
            const segmentData = bySegment[segmentId];
            if (!segmentData) return track;
            
            let health = 95; // Default healthy score
            
            // Critical conditions
            if (Number(segmentData['ray_temperature']) > 40 || Number(segmentData['ray_vibration_x']) > 2.5) {
                health = 40;
            } 
            // Warning conditions
            else if (Number(segmentData['train_speed']) > 85 || Math.abs(Number(segmentData['rail_slope']) ?? 0) > 3) {
                health = 70;
            }

            return { ...track, healthScore: health };
          });
          return { ...prevNetwork, tracks: newTracks };
        });
      }
    } catch (error) {
      setTelemetryError("Gerçek zamanlı telemetri verisi yüklenirken bir hata oluştu. Lütfen sunucu bağlantınızı kontrol edin.");
      console.error(error);
    } finally {
      setTelemetryLoading(false);
    }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const simulateTrackWear = () => {
    if (!network) return;
    setNetwork(prev => {
      if (!prev) return null;
      return {
        ...prev,
        tracks: prev.tracks.map(t => ({
          ...t,
          healthScore: Math.max(10, t.healthScore - (Math.random() > 0.7 ? 2 : 0)),
          accumulatedTonnage: t.accumulatedTonnage + (Math.random() * 50000)
        }))
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1419] flex flex-col">
      <TopNavbar userRole={userRole} setUserRole={setUserRole} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} userRole={userRole} />

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

          {/* 1. GENEL BAKIŞ (OVERVIEW) - Full Dashboard */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Aktif Sensörler" value={sensorCount} icon={Radio} color="blue" />
                <KPICard title="Tespit Edilen Anomaliler" value={anomalies.length} icon={AlertTriangle} color="red" />
                <KPICard title="Yüksek Riskli Segmentler" value={network?.tracks.filter(t => t.healthScore < 50).length || 0} icon={Activity} color="yellow" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                    <div className="flex gap-2">
                      <button onClick={() => setMapMode('status')} className={`px-4 py-1.5 rounded-md text-xs font-bold border ${mapMode === 'status' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}>OPERASYONEL DURUM</button>
                      <button onClick={() => setMapMode('maintenance')} className={`px-4 py-1.5 rounded-md text-xs font-bold border ${mapMode === 'maintenance' ? 'bg-yellow-600 border-yellow-400 text-white' : 'bg-gray-900 border-gray-700 text-gray-400'}`}>BAKIM HARİTASI</button>
                    </div>
                    <button onClick={simulateTrackWear} className="px-4 py-1.5 bg-purple-600 border border-purple-400 text-white rounded-md text-xs font-bold shadow-lg shadow-purple-500/20">ZAMANI HIZLANDIR</button>
                  </div>
                  <div className="border border-gray-700 rounded-lg overflow-hidden h-[500px] shadow-2xl bg-gray-900/40">
                    <GISMap
                      network={network}
                      activeRoute={routeResult}
                      viewMode={mapMode}
                      selectedTrackId={selectedTrackId}
                      selectedTrainId={selectedTrainId}
                      trains={trains}
                      onSelectTrack={setSelectedTrackId}
                      onSelectTrain={handleSelectTrain}
                    />
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <MaintenanceDashboard network={network} />
                </div>
              </div>

              {/* IoT Segment Analysis - Full Width */}
              <div className="grid grid-cols-1 gap-6">
                <SensorInsightPanel track={network?.tracks.find(t => t.id === selectedTrackId) || null} />
              </div>

              <div className="grid grid-cols-1 gap-6">
                <AnomalyTimeline anomalies={anomalies} />
              </div>

              {/* Lojistik Simülatörü */}
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-xl">
                <h3 className="text-white text-lg font-bold mb-6 flex items-center gap-2"><Zap className="text-yellow-400 w-5 h-5" /> Lojistik Simülatörü</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                  <div className="space-y-2">
                    <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block">Başlangıç İstasyonu</label>
                    <select className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700" value={startStation} onChange={(e) => setStartStation(e.target.value)}>
                      {network?.stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block">Hedef İstasyon</label>
                    <select className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700" value={endStation} onChange={(e) => setEndStation(e.target.value)}>
                      {network?.stations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between mb-2">
                      <label className="text-gray-500 text-[10px] font-bold uppercase tracking-wider block">Tren Yükü</label>
                      <span className="text-yellow-400 font-bold text-sm font-mono">{trainLoad} Ton</span>
                    </div>
                    <input type="range" min="100" max="1500" step="50" value={trainLoad} onChange={(e) => setTrainLoad(Number(e.target.value))} className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500" />
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

          {activeSection === "track-detail" && (
            <TrackDetailPage
              network={network}
              selectedTrackId={selectedTrackId}
              onSelectTrackId={setSelectedTrackId}
              selectedTrack={selectedTrack}
            />
          )}

          {activeSection === "train-detail" && (
            <TrainDetailPage
              trains={trains}
              selectedTrainId={selectedTrainId}
              onSelectTrainId={setSelectedTrainId}
              selectedTrain={selectedTrain}
              network={network}
              sensorData={sensorData}
            />
          )}

          {/* 2. CANLI SENSÖR İZLEME (SENSORS) */}
          {activeSection === "sensors" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">Canlı Sensör İzleme Ağı</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <SensorChart title="Ray Sıcaklığı" dataKey="temperature" color="#ef4444" data={sensorData} unit="°C" />
                <SensorChart title="Ray Titreşimi" dataKey="vibration" color="#3b82f6" data={sensorData} unit=" Hz" />
                <SensorChart title="Hat Eğimi" dataKey="tilt" color="#10b981" data={sensorData} unit="°" />
                <SensorChart title="Vagon Sıcaklığı" dataKey="trainTemp" color="#f59e0b" data={sensorData} unit="°C" />
                <SensorChart title="Tren Hızı" dataKey="speed" color="#8b5cf6" data={sensorData} unit=" km/h" />
                <SensorChart title="Vagon Titreşimi" dataKey="trainVib" color="#ec4899" data={sensorData} unit=" Hz" />
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
                      { label: "Basınç Sensörleri", status: "8/10 Aktif", color: "red" }
                    ].map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl border border-gray-700/50">
                        <span className="text-gray-300 font-medium">{s.label}</span>
                        <span className={`text-${s.color}-400 font-bold font-mono`}>{s.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. ANOMALİ TESPİTİ (ANOMALY) */}
          {activeSection === "anomaly" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">Gerçek Zamanlı Anomali Tespiti</h2>
              <AnomalyTimeline anomalies={anomalies} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Toplam Anomaliler" value={anomalies.length} icon={AlertTriangle} color="red" />
                <KPICard title="Kritik Uyarılar" value={anomalies.filter(a => a.severity === 'yüksek').length} icon={AlertTriangle} color="yellow" />
                <KPICard title="İzlenen Segmentler" value={sensorCount > 0 ? 6 : 0} icon={Activity} color="green" />
              </div>
            </div>
          )}

          {/* 4. ROTA KARŞILAŞTIRMA (ROUTE COMPARISON) */}
          {activeSection === "route-comparison" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">Rota Karşılaştırma ve Optimizasyon</h2>
              <RouteOptimizationPanel />
            </div>
          )}

          {/* 5. ÖNGÖRÜLÜ BAKIM (MAINTENANCE) */}
          {activeSection === "maintenance" && (
            <div className="space-y-8">
              <h2 className="text-white text-2xl font-bold mb-4">Öngörülü Bakım ve RUL Analizi</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(network?.tracks ?? [])
                  // Çift yönlü hatları tekilleştir (S1 ve S1-R → sadece S1)
                  .filter((t, _, arr) => !t.id.endsWith('-R') || !arr.some(x => x.id === t.id.replace('-R', '')))
                  .sort((a, b) => a.healthScore - b.healthScore)
                  .slice(0, 3)
                  .map(track => {
                    const rul = Math.max(3, Math.round((track.healthScore - 20) * 1.8));
                    const color = track.healthScore < 50 ? 'red' : track.healthScore < 80 ? 'yellow' : 'green';
                    const warning = track.healthScore < 50
                      ? '⚠️ Kritik: Acil bakım gerekli'
                      : track.healthScore < 80
                        ? `Öneri: ${Math.round(rul * 0.6)} gün içinde muayene`
                        : '✓ İyi durum - Düzenli izleme';
                    return (
                      <div key={track.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
                        <h3 className="text-white text-lg font-bold mb-4">{track.id} Hattı</h3>
                        <div className={`text-${color}-400 text-4xl font-bold mb-2`}>{rul} gün</div>
                        <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider">Kalan Yararlı Ömür (RUL)</p>
                        <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
                          <div className={`bg-${color}-500 h-3 rounded-full shadow-lg`} style={{ width: `${track.healthScore}%` }}></div>
                        </div>
                        <div className={`text-sm font-medium ${track.healthScore < 50 ? 'text-red-400' : 'text-gray-400'}`}>{warning}</div>
                      </div>
                    );
                  })}
              </div>
              <MaintenanceDashboard network={network} />
            </div>
          )}

          {/* 5. ENERJİ & RİSK (ENERGY-RISK) */}
          {activeSection === "energy-risk" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">Enerji & Risk Analizi</h2>
              <EnergyRiskDashboard />
            </div>
          )}

          {/* 6. AÇIKLANABILIR YAPAY ZEKA (XAI) */}
          {activeSection === "xai" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">Açıklanabilir AI Analiz</h2>
              <ExplainableAIPanel />
            </div>
          )}

          {/* 7. RAPORLAR VE KARARLAR (REPORTS) */}
          {activeSection === "reports" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">Generatif AI Raporları</h2>
              <GenerativeReportPanel />
            </div>
          )}

          {/* 8. AYARLAR (SETTINGS) */}
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