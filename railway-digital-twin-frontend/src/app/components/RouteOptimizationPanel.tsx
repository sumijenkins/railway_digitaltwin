import { useMemo, useState } from "react";
import { MapPin, Zap, AlertTriangle, Clock } from "lucide-react";

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
  advantages: string[];
  disadvantages: string[];
}

const routeCandidates: RouteOption[] = [
  {
    id: "R1",
    origin: "Merkez İstasyonu",
    destination: "Doğu Terminali",
    name: "Enerji Verimli Rota",
    distance: "285 km",
    estimatedTime: "4s 35d",
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
    name: "Hızlı Alternatif Rota",
    distance: "298 km",
    estimatedTime: "4s 12d",
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
    name: "Risk Azaltma Rota",
    distance: "312 km",
    estimatedTime: "5s 05d",
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
      const timeScore = Math.max(0, 100 - Math.round(parseInt(route.estimatedTime) || 0));
      const weighted = Math.round(
        route.energyEfficiency * weights.energy * 0.01 +
        (100 - route.riskScore) * weights.risk * 0.01 +
        timeScore * weights.time * 0.01
      );

      return {
        ...route,
        overallScore: weighted,
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
  }, [selectedOrigin, selectedDestination, weights]);

  const selectedRoute = routeOptions[0];
  const alternatives = routeOptions.slice(1);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h3 className="text-white text-xl font-semibold">Rota Karşılaştırma Paneli</h3>
          <p className="text-gray-400 text-sm mt-1">Enerji, risk ve süre değerlerine göre en uygun rotayı seçin.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 w-full md:w-auto">
          <div className="space-y-2">
            <label className="text-gray-400 text-xs uppercase tracking-wide">Başlangıç</label>
            <select
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
            >
              {originOptions.map((origin) => (
                <option key={origin} value={origin}>{origin}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-gray-400 text-xs uppercase tracking-wide">Hedef</label>
            <select
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
            >
              {destinationOptions.map((destination) => (
                <option key={destination} value={destination}>{destination}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
            <Zap className="w-4 h-4 text-green-400" />
            Enerji Önceliği
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={weights.energy}
            onChange={(e) => setWeights({ ...weights, energy: parseInt(e.target.value) })}
            className="w-full h-2 accent-green-500"
          />
          <div className="text-xs text-gray-300 mt-2">{weights.energy}%</div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            Risk Azaltma Önceliği
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={weights.risk}
            onChange={(e) => setWeights({ ...weights, risk: parseInt(e.target.value) })}
            className="w-full h-2 accent-yellow-500"
          />
          <div className="text-xs text-gray-300 mt-2">{weights.risk}%</div>
        </div>

        <div className="rounded-xl border border-gray-700 bg-gray-900 p-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
            <Clock className="w-4 h-4 text-blue-400" />
            Zaman Optimizasyonu
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={weights.time}
            onChange={(e) => setWeights({ ...weights, time: parseInt(e.target.value) })}
            className="w-full h-2 accent-blue-500"
          />
          <div className="text-xs text-gray-300 mt-2">{weights.time}%</div>
        </div>
      </div>

      {selectedRoute ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-green-600/30 bg-green-900/10 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">Önerilen Rota</p>
                <h4 className="text-white text-2xl font-semibold mt-2">{selectedRoute.name}</h4>
                <p className="text-gray-400 mt-1">{selectedRoute.origin} → {selectedRoute.destination}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-gray-900 p-3 text-center">
                  <p className="text-gray-400 text-xs uppercase">Enerji</p>
                  <p className="text-white font-semibold text-lg">{selectedRoute.energyScore}%</p>
                </div>
                <div className="rounded-xl bg-gray-900 p-3 text-center">
                  <p className="text-gray-400 text-xs uppercase">Risk</p>
                  <p className="text-white font-semibold text-lg">{selectedRoute.riskScore}%</p>
                </div>
                <div className="rounded-xl bg-gray-900 p-3 text-center">
                  <p className="text-gray-400 text-xs uppercase">Süre</p>
                  <p className="text-white font-semibold text-lg">{selectedRoute.estimatedTime}</p>
                </div>
                <div className="rounded-xl bg-gray-900 p-3 text-center">
                  <p className="text-gray-400 text-xs uppercase">Skor</p>
                  <p className="text-white font-semibold text-lg">{selectedRoute.overallScore}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-white text-lg font-semibold mb-4">Alternatif Rotalar</h5>
            <div className="grid gap-4 lg:grid-cols-3">
              {alternatives.map((route) => (
                <div key={route.id} className="rounded-xl border border-gray-700 bg-gray-900 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-400">{route.name}</span>
                    <span className="text-xs uppercase tracking-wider text-yellow-400">Alternatif</span>
                  </div>
                  <div className="space-y-3 text-gray-300">
                    <div className="flex items-center justify-between">
                      <span>Mesafe</span>
                      <span>{route.distance}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Enerji</span>
                      <span>{route.energyScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Risk</span>
                      <span>{route.riskScore}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Güvenlik</span>
                      <span>{route.safetyScore}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
              <h5 className="text-white text-lg font-semibold mb-3">Avantajlar</h5>
              <ul className="space-y-2 text-gray-300">
                {selectedRoute.advantages.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
              <h5 className="text-white text-lg font-semibold mb-3">Dikkat Edilmesi Gerekenler</h5>
              <ul className="space-y-2 text-gray-300">
                {selectedRoute.disadvantages.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 text-center text-gray-300">
          Seçilen başlangıç ve hedef için uygun rota verisi bulunamadı.
        </div>
      )}
    </div>
  );
}
