import { useMemo, useState } from "react";
import { Zap, AlertTriangle, Clock, Lightbulb, Target, MapPin, TrendingUp } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

interface RouteOption {
  id: string;
  origin: string;
  destination: string;
  name: string;
  distance: string;
  estimatedTime: string;
  energyScore: number;
  riskScore: number;
  energyEfficiency: number;
  safetyScore: number;
  timeScoreVal: number;
  advantages: string[];
  disadvantages: string[];
}

const routeCandidates: RouteOption[] = [
  {
    id: "R1",
    origin: "Merkez İstasyonu",
    destination: "Doğu Terminali",
    name: "Optimum (Enerji Öncelikli)",
    distance: "285 km",
    estimatedTime: "4s 35d",
    timeScoreVal: 75,
    energyScore: 92,
    riskScore: 15,
    energyEfficiency: 94,
    safetyScore: 88,
    advantages: ["Düşük enerji tüketimi", "Kritik segmentlerden kaçınılır"],
    disadvantages: ["Hafifçe daha uzun mesafe"],
  },
  {
    id: "R2",
    origin: "Merkez İstasyonu",
    destination: "Doğu Terminali",
    name: "Alternatif 1 (Hız Öncelikli)",
    distance: "298 km",
    estimatedTime: "4s 12d",
    timeScoreVal: 90,
    energyScore: 83,
    riskScore: 22,
    energyEfficiency: 81,
    safetyScore: 76,
    advantages: ["Daha kısa süre", "Yüklemede esneklik"],
    disadvantages: ["Enerji tüketimi biraz daha yüksek"],
  },
  {
    id: "R3",
    origin: "Merkez İstasyonu",
    destination: "Doğu Terminali",
    name: "Alternatif 2 (Güvenlik Öncelikli)",
    distance: "312 km",
    estimatedTime: "5s 05d",
    timeScoreVal: 60,
    energyScore: 75,
    riskScore: 8,
    energyEfficiency: 72,
    safetyScore: 94,
    advantages: ["En düşük risk skoru", "En yüksek güvenlik seviyesi"],
    disadvantages: ["En uzun süre", "Daha fazla operasyonel kontrol gerektirir"],
  },
];

const originOptions = ["Merkez İstasyonu", "Kuzey Kavşağı", "Güney Deposu"];
const destinationOptions = ["Doğu Terminali", "Batı Merkezi", "Yük Sahası"];

export function RouteOptimizationPanel() {
  const [selectedOrigin, setSelectedOrigin] = useState(originOptions[0]);
  const [selectedDestination, setSelectedDestination] = useState(destinationOptions[0]);
  const [weights, setWeights] = useState({ energy: 45, risk: 35, time: 20 });

  const routeOptions = useMemo(() => {
    const filtered = routeCandidates.filter(
      (route) => route.origin === selectedOrigin && route.destination === selectedDestination
    );

    return filtered.map((route) => {
      const weighted = Math.round(
        route.energyEfficiency * weights.energy * 0.01 +
        route.safetyScore * weights.risk * 0.01 +
        route.timeScoreVal * weights.time * 0.01
      );

      return {
        ...route,
        overallScore: weighted,
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }, [selectedOrigin, selectedDestination, weights]);

  const selectedRoute = routeOptions[0];
  const alternatives = routeOptions.slice(1);

  // Radar Chart Data Prep
  const radarData = routeOptions.length === 3 ? [
    { subject: 'Enerji Verimliliği', A: routeOptions[0].energyEfficiency, B: routeOptions[1].energyEfficiency, C: routeOptions[2].energyEfficiency },
    { subject: 'Güvenlik (Ters Risk)', A: routeOptions[0].safetyScore, B: routeOptions[1].safetyScore, C: routeOptions[2].safetyScore },
    { subject: 'Zaman Skoru', A: routeOptions[0].timeScoreVal, B: routeOptions[1].timeScoreVal, C: routeOptions[2].timeScoreVal },
    { subject: 'Mesafe Verimliliği', A: 90, B: 80, C: 70 }, // Temsili
  ] : [];

  return (
    <div className="bg-[#151b23] rounded-xl p-6 border border-gray-700 shadow-2xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8 pb-6 border-b border-gray-800">
        <div>
          <h3 className="text-white text-2xl font-bold flex items-center gap-2">
            <Target className="text-blue-500 w-6 h-6" /> Multi-Criteria Rota Optimizasyonu
          </h3>
          <p className="text-gray-400 text-sm mt-2 max-w-2xl">
            Sistem Cost = α × Energy + β × Risk + γ × Time formülünü kullanarak dijital ikiz üzerinden en uygun 3 rotayı hesaplar ve karşılaştırmalı sunar.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 w-full md:w-auto">
          <div className="space-y-2">
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">Başlangıç İstasyonu</label>
            <select
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 shadow-inner"
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
            >
              {originOptions.map((origin) => <option key={origin} value={origin}>{origin}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-gray-400 text-xs font-bold uppercase tracking-wide">Hedef Terminal</label>
            <select
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 shadow-inner"
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
            >
              {destinationOptions.map((dest) => <option key={dest} value={dest}>{dest}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-5 shadow-inner">
          <div className="flex items-center gap-2 text-gray-300 font-medium text-sm mb-4">
            <Zap className="w-5 h-5 text-green-400" />
            Enerji Ağırlığı (α)
          </div>
          <input type="range" min="0" max="100" value={weights.energy} onChange={(e) => setWeights({ ...weights, energy: parseInt(e.target.value) })} className="w-full h-2 accent-green-500 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
          <div className="text-right text-sm text-green-400 font-bold mt-2">{weights.energy}%</div>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-5 shadow-inner">
          <div className="flex items-center gap-2 text-gray-300 font-medium text-sm mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            Risk Ağırlığı (β)
          </div>
          <input type="range" min="0" max="100" value={weights.risk} onChange={(e) => setWeights({ ...weights, risk: parseInt(e.target.value) })} className="w-full h-2 accent-yellow-500 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
          <div className="text-right text-sm text-yellow-400 font-bold mt-2">{weights.risk}%</div>
        </div>
        <div className="rounded-xl border border-gray-700 bg-gray-800/40 p-5 shadow-inner">
          <div className="flex items-center gap-2 text-gray-300 font-medium text-sm mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            Zaman Ağırlığı (γ)
          </div>
          <input type="range" min="0" max="100" value={weights.time} onChange={(e) => setWeights({ ...weights, time: parseInt(e.target.value) })} className="w-full h-2 accent-blue-500 bg-gray-700 rounded-lg appearance-none cursor-pointer" />
          <div className="text-right text-sm text-blue-400 font-bold mt-2">{weights.time}%</div>
        </div>
      </div>

      {selectedRoute ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Sol: Seçilen Rota Detayları */}
            <div className="xl:col-span-2 space-y-6">
              <div className="relative overflow-hidden rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-900/20 to-gray-900 p-6 shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl"></div>
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10">
                  <div>
                    <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-widest font-bold border rounded-full border-green-500/50 bg-green-500/10 text-green-400 mb-3">Önerilen Optimum Rota</span>
                    <h4 className="text-white text-3xl font-bold">{selectedRoute.name}</h4>
                    <p className="text-gray-400 mt-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {selectedRoute.origin} <span className="text-gray-600">→</span> {selectedRoute.destination}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-gray-950/50 p-4 border border-gray-800 text-center shadow-inner">
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Mesafe</p>
                      <p className="text-white font-bold text-xl mt-1">{selectedRoute.distance}</p>
                    </div>
                    <div className="rounded-xl bg-gray-950/50 p-4 border border-gray-800 text-center shadow-inner">
                      <p className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">Süre</p>
                      <p className="text-white font-bold text-xl mt-1">{selectedRoute.estimatedTime}</p>
                    </div>
                    <div className="rounded-xl bg-green-950/30 p-4 border border-green-900/50 text-center shadow-inner">
                      <p className="text-green-500/70 text-[10px] uppercase font-bold tracking-wider">Enerji</p>
                      <p className="text-green-400 font-bold text-xl mt-1">{selectedRoute.energyScore}%</p>
                    </div>
                    <div className="rounded-xl bg-blue-950/30 p-4 border border-blue-900/50 text-center shadow-inner relative overflow-hidden">
                      <p className="text-blue-500/70 text-[10px] uppercase font-bold tracking-wider">Opt. Skor</p>
                      <p className="text-blue-400 font-bold text-2xl mt-1">{selectedRoute.overallScore}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generative AI Analizi */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-5 border border-gray-700 shadow-inner flex gap-4">
                <Lightbulb className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="text-white font-bold text-sm mb-1 uppercase tracking-wide">Yapay Zeka Karar Özeti</h5>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Sistem belirlediğiniz %{weights.energy} Enerji ve %{weights.risk} Risk ağırlıklarına göre <strong>{selectedRoute.name}</strong> rotasını en uygun seçenek olarak belirlemiştir. 
                    Bu rota, risk skorunu %{selectedRoute.riskScore} seviyesinde tutarak maksimum güvenliği sağlarken, operasyonel sınırların içerisinde kalmaktadır. 
                    Alternatif rotalara kıyasla hesaplanan ağırlıklandırılmış algoritmada en yüksek performansı göstermiştir.
                  </p>
                </div>
              </div>
            </div>

            {/* Sağ: Radar Chart */}
            <div className="rounded-2xl border border-gray-700 bg-gray-800/30 p-4 shadow-lg flex flex-col items-center justify-center">
              <h5 className="text-white text-sm font-bold mb-2 uppercase tracking-wide text-center">Rota Performans Kıyaslaması</h5>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#374151" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <RechartsTooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Radar name={routeOptions[0]?.name.split(' ')[0]} dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                    <Radar name={routeOptions[1]?.name.split(' ')[0]} dataKey="B" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                    <Radar name={routeOptions[2]?.name.split(' ')[0]} dataKey="C" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          <div>
            <h5 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-gray-400 w-5 h-5" /> Diğer Alternatifler (Top-3)
            </h5>
            <div className="grid gap-4 lg:grid-cols-2">
              {alternatives.map((route) => (
                <div key={route.id} className="rounded-xl border border-gray-700 bg-gray-800/40 p-5 hover:bg-gray-800 transition-colors">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
                    <h6 className="text-md text-white font-bold">{route.name}</h6>
                    <div className="bg-gray-900 px-3 py-1 rounded border border-gray-700 text-blue-400 font-bold">
                      Skor: {route.overallScore}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Mesafe</span>
                      <span className="text-gray-300 font-medium">{route.distance}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Enerji</span>
                      <span className="text-green-400 font-medium">{route.energyScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Risk Skoru</span>
                      <span className="text-yellow-400 font-medium">{route.riskScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Süre</span>
                      <span className="text-blue-400 font-medium">{route.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-8 text-center text-gray-400">
          Seçilen başlangıç ve hedef için uygun rota verisi bulunamadı. Lütfen farklı bir istasyon seçin.
        </div>
      )}
    </div>
  );
}
