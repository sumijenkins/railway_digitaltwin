import { useState } from "react";
import { MapPin, Zap, AlertTriangle, Clock } from "lucide-react";

interface Route {
  id: string;
  name: string;
  energyScore: number;
  riskScore: number;
  estimatedTime: string;
  distance: string;
  segments: string[];
}

const routes: Route[] = [
  {
    id: "R1",
    name: "Birincil Rota (Yapay Zeka Önerisi)",
    energyScore: 92,
    riskScore: 15,
    estimatedTime: "4s 35d",
    distance: "285 km",
    segments: ["Merkez → Kuzey → Doğu"]
  },
  {
    id: "R2",
    name: "Alternatif Rota A",
    energyScore: 85,
    riskScore: 28,
    estimatedTime: "4s 52d",
    distance: "298 km",
    segments: ["Merkez → Batı → Doğu"]
  },
  {
    id: "R3",
    name: "Alternatif Rota B",
    energyScore: 78,
    riskScore: 42,
    estimatedTime: "5s 15d",
    distance: "312 km",
    segments: ["Merkez → Güney → Doğu"]
  }
];

export function RouteOptimizationPanel() {
  const [weights, setWeights] = useState({
    energy: 50,
    risk: 30,
    time: 20
  });

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-white text-xl mb-6">Yapay Zeka Destekli Rota Optimizasyonu</h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Başlangıç Konumu</label>
          <select className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500">
            <option>Merkez İstasyon (S1)</option>
            <option>Kuzey Kavşağı (S2)</option>
            <option>Güney Deposu (S4)</option>
          </select>
        </div>
        <div>
          <label className="text-gray-400 text-sm mb-2 block">Hedef</label>
          <select className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500">
            <option>Doğu Terminali (S3)</option>
            <option>Batı Merkezi (S5)</option>
            <option>Yük Sahası (S6)</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Enerji Verimliliği Önceliği</span>
            <span className="text-green-400">{weights.energy}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={weights.energy}
            onChange={(e) => setWeights({ ...weights, energy: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Risk Azaltma Önceliği</span>
            <span className="text-yellow-400">{weights.risk}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={weights.risk}
            onChange={(e) => setWeights({ ...weights, risk: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Zaman Optimizasyonu Önceliği</span>
            <span className="text-blue-400">{weights.time}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={weights.time}
            onChange={(e) => setWeights({ ...weights, time: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {routes.map((route, idx) => (
          <div
            key={route.id}
            className={`p-4 rounded-lg border transition-all ${idx === 0
                ? "bg-gradient-to-r from-blue-900/30 to-green-900/30 border-green-500"
                : "bg-gray-900 border-gray-700 hover:border-gray-600"
              }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-white mb-1">{route.name}</h4>
                <p className="text-gray-400 text-sm">{route.segments[0]}</p>
              </div>
              {idx === 0 && (
                <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full">
                  Önerilen
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <div className="flex items-center gap-2 text-green-400 text-sm mb-1">
                  <Zap className="w-4 h-4" />
                  <span>Enerji</span>
                </div>
                <div className="text-white">{route.energyScore}%</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-yellow-400 text-sm mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Risk</span>
                </div>
                <div className="text-white">{route.riskScore}%</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-blue-400 text-sm mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Süre</span>
                </div>
                <div className="text-white">{route.estimatedTime}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-purple-400 text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>Mesafe</span>
                </div>
                <div className="text-white">{route.distance}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
