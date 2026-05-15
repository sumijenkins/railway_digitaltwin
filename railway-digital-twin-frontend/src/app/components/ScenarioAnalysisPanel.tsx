import React, { useState, useEffect } from "react";
import { Play, Activity, TrendingUp, AlertTriangle, Info, Zap, Thermometer, RefreshCw, Gauge } from "lucide-react";
import { scenarioService, ScenarioRequestDto, ScenarioResponseDto, SensorFeature } from "../../services/scenarioService";

export function ScenarioAnalysisPanel() {
  const [segmentId, setSegmentId] = useState<string>("S1");
  
  // Kullanıcının oynayacağı 6 ana veri
  const [raySicakligi, setRaySicakligi] = useState<number>(25.0);
  const [rayTitresimi, setRayTitresimi] = useState<number>(1.2);
  const [hatEgimi, setHatEgimi] = useState<number>(0.0);
  const [vagonSicakligi, setVagonSicakligi] = useState<number>(22.0);
  const [trenHizi, setTrenHizi] = useState<number>(80.0);
  const [vagonTitresimi, setVagonTitresimi] = useState<number>(0.8);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingDefaults, setFetchingDefaults] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScenarioResponseDto | null>(null);

  const fetchDefaults = async (id: string) => {
    setFetchingDefaults(true);
    try {
      const latest = await scenarioService.getLatestData(id);
      if (latest) {
        setRayTitresimi(latest.rms || 0);
        if (latest.slopeGradient !== undefined && latest.slopeGradient !== null) {
          setHatEgimi(Math.atan(latest.slopeGradient) * 180 / Math.PI);
        }
        // Diğer veriler feature içinde yoksa varsayılan kalsın
      }
    } catch (err) {
      console.error("Defaults could not be fetched", err);
    } finally {
      setFetchingDefaults(false);
    }
  };

  useEffect(() => {
    fetchDefaults(segmentId);
  }, [segmentId]);

  const handleSimulate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const request: ScenarioRequestDto = {
      segmentId,
      raySicakligi,
      rayTitresimi,
      hatEgimi,
      vagonSicakligi,
      trenHizi,
      vagonTitresimi
    };

    try {
      // Backend DTO'da isimlerin Türkçe olduğundan emin olun (Service katmanında eşleşmeli)
      const response = await scenarioService.simulateScenario(request as any); 
      setResult(response);
    } catch (err: any) {
      setError(err.message || "Simülasyon sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const segmentOptions = ["S1", "S2", "S3", "S4", "S5", "S6"];

  return (
    <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-white text-2xl font-bold flex items-center gap-3">
          <Play className="text-blue-400 w-7 h-7" /> Senaryo Analiz Simülatörü
        </h3>
        <button 
          onClick={() => fetchDefaults(segmentId)}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest bg-gray-900/50 px-3 py-2 rounded-lg border border-gray-700"
          disabled={fetchingDefaults}
        >
          <RefreshCw className={`w-3 h-3 ${fetchingDefaults ? 'animate-spin' : ''}`} />
          Güncel Verileri Getir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
        <div className="space-y-6 bg-gray-900/50 p-6 rounded-xl border border-gray-700/50 shadow-inner">
          <div className="space-y-2">
            <label className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Hedef Segment</label>
            <select
              className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 outline-none focus:border-blue-500"
              value={segmentId}
              onChange={(e) => setSegmentId(e.target.value)}
            >
              {segmentOptions.map((seg) => (
                <option key={seg} value={seg}>{seg}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Thermometer className="w-3 h-3" /> Ray Sıcaklığı (°C)
                </label>
                <input type="number" value={raySicakligi} onChange={(e) => setRaySicakligi(Number(e.target.value))} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 outline-none" />
             </div>
             <div className="space-y-2">
                <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Ray Titreşimi (RMS)
                </label>
                <input type="number" value={rayTitresimi} onChange={(e) => setRayTitresimi(Number(e.target.value))} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 outline-none" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Hat Eğimi (Derece)
                </label>
                <input type="number" value={hatEgimi} onChange={(e) => setHatEgimi(Number(e.target.value))} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 outline-none" />
             </div>
             <div className="space-y-2">
                <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Gauge className="w-3 h-3" /> Tren Hızı (km/h)
                </label>
                <input type="number" value={trenHizi} onChange={(e) => setTrenHizi(Number(e.target.value))} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 outline-none" />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Thermometer className="w-3 h-3 text-blue-400" /> Vagon Sıcaklığı (°C)
                </label>
                <input type="number" value={vagonSicakligi} onChange={(e) => setVagonSicakligi(Number(e.target.value))} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 outline-none" />
             </div>
             <div className="space-y-2">
                <label className="text-gray-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                    <Activity className="w-3 h-3 text-blue-400" /> Vagon Titreşimi (RMS)
                </label>
                <input type="number" value={vagonTitresimi} onChange={(e) => setVagonTitresimi(Number(e.target.value))} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-700 outline-none" />
             </div>
          </div>

          <button
            onClick={handleSimulate}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
              loading ? "bg-gray-700 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500"
            }`}
          >
            {loading ? "Hesaplanıyor..." : "Senaryoyu Test Et"}
          </button>
        </div>

        <div className="flex flex-col justify-center">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-200">
                <p className="text-sm">{error}</p>
            </div>
          )}

          {!error && !result && !loading && (
            <div className="h-full border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-500 p-8 text-center bg-gray-800/50">
              <Zap className="w-16 h-16 mb-4 text-gray-600 opacity-50" />
              <p className="text-sm">Parametreleri belirleyin ve testi başlatın.</p>
            </div>
          )}

          {result && !loading && (
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-lg space-y-6">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                <h4 className="text-white font-bold text-lg">Analiz Sonucu</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  result.riskLevel === 'CRITICAL' || result.riskLevel === 'DANGER' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                  result.riskLevel === 'WARNING' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                  'bg-green-500/20 text-green-400 border border-green-500/30'
                }`}>
                  {result.riskLevel}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-500 text-[10px] font-bold uppercase">Tahmini Kalan Ömür</p>
                  <div className="text-2xl font-bold text-white">
                    {result.simulatedRul != null ? result.simulatedRul.toFixed(1) : "---"} Gün
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-500 text-[10px] font-bold uppercase">Anomali Durumu</p>
                  <div className={`font-bold mt-1 ${result.simulatedAnomaly ? 'text-red-400' : 'text-green-400'}`}>
                    {result.simulatedAnomaly ? 'RİSKLİ' : 'NORMAL'}
                  </div>
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-gray-300 text-sm italic">"{result.explanation}"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
