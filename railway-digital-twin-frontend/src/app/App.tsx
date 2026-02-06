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
  const [network, setNetwork] = useState<RailwayNetwork | null>(null);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [trainLoad, setTrainLoad] = useState<number>(400);
  const [startStation, setStartStation] = useState<string>('izm-c');
  const [endStation, setEndStation] = useState<string>('ban');
  const [mapMode, setMapMode] = useState<'status' | 'maintenance'>('status');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

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
      const data = await telemetryService.getLatestTelemetry();
      if (data && data.length > 0) {
        // 1. Transform backend data to frontend chart format
        const chartData = data.slice(0, 20).reverse().map((d: any, index: number) => ({
          time: new Date(new Date(d.timestamp).getTime() + (index * 1000)).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          temperature: d.ray_temperature,
          vibration: d.ray_vibration_x,
          tilt: d.rail_slope,
          trainTemp: d.train_temperature,
          speed: d.train_speed,
          trainVib: d.train_vibration_x
        }));
        setSensorData(chartData);

        // 2. Real-time Anomaly Detection Logic
        const latest: any = data[0];
        const newDetectedAnomalies: any[] = [];

        if (latest.ray_temperature > 40) {
          newDetectedAnomalies.push({
            time: new Date(latest.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            type: "Kritik Sıcaklık",
            severity: "yüksek",
            location: `Segment ${latest.segment_id}`,
            value: `${latest.ray_temperature.toFixed(1)}°C`,
            status: "aktif"
          });
        }

        if (latest.train_speed > 85) {
          newDetectedAnomalies.push({
            time: new Date(latest.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            type: "Aşırı Hız Limit Aşımı",
            severity: "orta",
            location: `Segment ${latest.segment_id}`,
            value: `${latest.train_speed.toFixed(1)} km/h`,
            status: "aktif"
          });
        }

        if (latest.ray_vibration_x > 2.5) {
          newDetectedAnomalies.push({
            time: new Date(latest.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            type: "Yüksek Ray Titreşimi",
            severity: "yüksek",
            location: `Segment ${latest.segment_id}`,
            value: `${latest.ray_vibration_x.toFixed(2)} Hz`,
            status: "aktif"
          });
        }

        if (Math.abs(latest.rail_slope) > 3) {
          newDetectedAnomalies.push({
            time: new Date(latest.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            type: "Hatalı Ray Eğimi",
            severity: "orta",
            location: `Segment ${latest.segment_id}`,
            value: `${latest.rail_slope.toFixed(1)}°`,
            status: "izleniyor"
          });
        }

        if (newDetectedAnomalies.length > 0) {
          setAnomalies(prev => {
            // Only add unique anomalies for the same second/location combo
            const filtered = newDetectedAnomalies.filter(newA =>
              !prev.some(oldA => oldA.time === newA.time && oldA.type === newA.type)
            );
            return [...filtered, ...prev].slice(0, 10);
          });
        }
      }
    };

    fetchData(); // Initial fetch
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
      <TopNavbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <main className="flex-1 overflow-y-auto p-6">

          {/* 1. GENEL BAKIŞ (OVERVIEW) - Full Dashboard */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard title="Aktif Sensörler" value={247} icon={Radio} color="blue" />
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
                    <GISMap network={network} activeRoute={routeResult} viewMode={mapMode} selectedTrackId={selectedTrackId} onSelectTrack={setSelectedTrackId} />
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
              </div>
            </div>
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
                <KPICard title="Toplam Anomaliler (24s)" value={23} icon={AlertTriangle} color="red" />
                <KPICard title="Kritik Uyarılar" value={2} icon={AlertTriangle} color="yellow" />
                <KPICard title="Ortalama Çözüm Süresi" value="12 Dakika" icon={Activity} color="green" />
              </div>
            </div>
          )}

          {/* 4. ÖNGÖRÜLÜ BAKIM (MAINTENANCE) */}
          {activeSection === "maintenance" && (
            <div className="space-y-8">
              <h2 className="text-white text-2xl font-bold mb-4">Öngörülü Bakım ve RUL Analizi</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { id: 'S3', health: 60, days: 45, color: 'yellow', warning: 'Öneri: 30 gün içinde muayene' },
                  { id: 'S5', health: 22, days: 12, color: 'red', warning: '⚠️ Kritik: Acil bakım gerekli' },
                  { id: 'S1', health: 95, days: 180, color: 'green', warning: '✓ İyi durum - Düzenli izleme' }
                ].map(item => (
                  <div key={item.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
                    <h3 className="text-white text-lg font-bold mb-4">Segment {item.id}</h3>
                    <div className={`text-${item.color}-400 text-4xl font-bold mb-2`}>{item.days} gün</div>
                    <p className="text-gray-500 text-sm mb-6 uppercase tracking-wider">Kalan Yararlı Ömür (RUL)</p>
                    <div className="w-full bg-gray-700 rounded-full h-3 mb-6">
                      <div className={`bg-${item.color}-500 h-3 rounded-full shadow-lg`} style={{ width: `${item.health}%` }}></div>
                    </div>
                    <div className={`text-sm font-medium ${item.health < 30 ? 'text-red-400' : 'text-gray-400'}`}>{item.warning}</div>
                  </div>
                ))}
              </div>
              <MaintenanceDashboard network={network} />
            </div>
          )}

          {/* 5. DİĞER (XAI, REPORT, SETTINGS) */}
          {activeSection === "xai" && <ExplainableAIPanel />}
          {activeSection === "reports" && (
            <div className="space-y-6">
              <h2 className="text-white text-2xl font-bold mb-4">Stratejik Karar Raporları</h2>
              <div className="bg-gray-800 rounded-xl p-8 border border-gray-700">
                <p className="text-gray-300 italic">Hattın genel verimlilik ve maliyet analiz raporları burada listelenir.</p>
                {routeResult && <div className="mt-8"><OperationalAnalytics routeResult={routeResult} trainLoad={trainLoad} /></div>}
              </div>
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