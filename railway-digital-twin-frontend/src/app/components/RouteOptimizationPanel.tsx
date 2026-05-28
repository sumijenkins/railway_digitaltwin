import { useEffect, useState } from "react";
import { Zap, AlertTriangle, Clock, Route, MapPin } from "lucide-react";

interface RouteOption {
  rank: number;
  segmentIds: string[];
  stationPath: string[];
  totalDistanceKm: number;
  totalEnergyRisk: number;
  activeAnomaliesCount: number;
  totalCostScore: number;
  estimatedTimeHours: number;
  totalEnergyScore: number;
  riskLevel: string;
  decisionReason: string;
}

const stationOptions = [
  "Izmir",
  "Manisa",
  "Akhisar",
  "Soma",
  "Balikesir",
  "Susurluk",
  "Bandirma",
  "Usak",
  "Afyonkarahisar",
  "Eskisehir",
  "Ankara",
  "Istanbul",
  "Gebze",
  "Izmit",
  "Arifiye",
  "Bilecik",
  "Kutahya",
];

export function RouteOptimizationPanel() {
  const [selectedOrigin, setSelectedOrigin] = useState("Izmir");
  const [selectedDestination, setSelectedDestination] = useState("Bandirma");
  const [weights, setWeights] = useState({ energy: 45, risk: 35, time: 20 });
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRoutes = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/routes/optimize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startStation: selectedOrigin,
            endStation: selectedDestination,
            weightDistance: weights.time / 100,
            weightEnergy: weights.energy / 100,
            weightRisk: weights.risk / 100,
          }),
        }
      );

      const data = await response.json();

      setRouteOptions(data.topRoutes || []);
    } catch (error) {
      console.error("Route optimization error:", error);
      setRouteOptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, [selectedOrigin, selectedDestination, weights]);

  const selectedRoute = routeOptions[0];
  const alternatives = routeOptions.slice(1);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h3 className="text-white text-xl font-semibold">
            Rota Karşılaştırma Paneli
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Enerji, risk ve süre ağırlıklarına göre backend tarafından hesaplanan rotalar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 w-full md:w-auto">
          <div className="space-y-2">
            <label className="text-gray-400 text-xs uppercase tracking-wide">
              Başlangıç
            </label>
            <select
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
            >
              {stationOptions.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-gray-400 text-xs uppercase tracking-wide">
              Hedef
            </label>
            <select
              className="w-full bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
            >
              {stationOptions.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
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
            onChange={(e) =>
              setWeights({ ...weights, energy: parseInt(e.target.value) })
            }
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
            onChange={(e) =>
              setWeights({ ...weights, risk: parseInt(e.target.value) })
            }
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
            onChange={(e) =>
              setWeights({ ...weights, time: parseInt(e.target.value) })
            }
            className="w-full h-2 accent-blue-500"
          />
          <div className="text-xs text-gray-300 mt-2">{weights.time}%</div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-700 bg-gray-900 p-6 text-center text-gray-300">
          Rota optimizasyonu hesaplanıyor...
        </div>
      ) : selectedRoute ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-green-600/30 bg-green-900/10 p-5">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-gray-400 text-sm uppercase tracking-wide">
                  Önerilen Rota
                </p>
                <h4 className="text-white text-2xl font-semibold mt-2 flex items-center gap-2">
                  <Route className="w-6 h-6 text-green-400" />
                  {selectedRoute.stationPath.join(" → ")}
                </h4>
                <p className="text-gray-400 mt-2">
                  Segmentler: {selectedRoute.segmentIds.join(", ")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                <div className="rounded-xl bg-gray-900 p-3 text-center">
                  <p className="text-gray-400 text-xs uppercase">Mesafe</p>
                  <p className="text-white font-semibold text-lg">
                    {selectedRoute.totalDistanceKm} km
                  </p>
                </div>

                <div className="rounded-xl bg-gray-900 p-3 text-center">
                  <p className="text-gray-400 text-xs uppercase">Enerji</p>
                  <p className="text-white font-semibold text-lg">
                    {selectedRoute.totalEnergyScore}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-900 p-3 text-center">
                  <p className="text-gray-400 text-xs uppercase">Risk</p>
                  <p
                    className={`font-semibold text-lg ${
                      selectedRoute.riskLevel === "HIGH"
                        ? "text-red-400"
                        : selectedRoute.riskLevel === "MEDIUM"
                          ? "text-yellow-400"
                          : "text-green-400"
                    }`}
                  >
                    {selectedRoute.riskLevel}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-900 p-3 text-center">
                  <p className="text-gray-400 text-xs uppercase">Süre</p>
                  <p className="text-white font-semibold text-lg">
                    {selectedRoute.estimatedTimeHours} saat
                  </p>
                </div>

                <div className="rounded-xl bg-gray-900 p-3 text-center">
                  <p className="text-gray-400 text-xs uppercase">Maliyet Skoru</p>
                  <p className="text-white font-semibold text-lg">
                    {selectedRoute.totalCostScore}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-gray-900 p-4 border border-gray-700">
                <p className="text-gray-400 text-xs uppercase mb-2">
                  DSS Rota Açıklaması
                </p>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {selectedRoute.decisionReason}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-white text-lg font-semibold mb-4">
              Alternatif Rotalar
            </h5>

            {alternatives.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {alternatives.map((route) => (
                  <div
                    key={route.rank}
                    className="rounded-xl border border-gray-700 bg-gray-900 p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-400">
                        Alternatif #{route.rank}
                      </span>
                      <span className="text-xs uppercase tracking-wider text-yellow-400">
                        {route.riskLevel}
                      </span>
                    </div>

                    <p className="text-white text-sm mb-3">
                      {route.stationPath.join(" → ")}
                    </p>

                    <div className="space-y-3 text-gray-300">
                      <div className="flex items-center justify-between">
                        <span>Mesafe</span>
                        <span>{route.totalDistanceKm} km</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Enerji</span>
                        <span>{route.totalEnergyScore}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Risk</span>
                        <span>{route.riskLevel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Süre</span>
                        <span>{route.estimatedTimeHours} saat</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Aktif Anomali</span>
                        <span>{route.activeAnomaliesCount}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-700 bg-gray-900 p-5 text-gray-300">
                Mevcut segment ağı tek hatlı olduğu için alternatif rota bulunamadı.
              </div>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
              <h5 className="text-white text-lg font-semibold mb-3">
                Karar Kriterleri
              </h5>
              <ul className="space-y-2 text-gray-300">
                <li>• Mesafe ağırlığı: %{weights.time}</li>
                <li>• Enerji ağırlığı: %{weights.energy}</li>
                <li>• Risk ağırlığı: %{weights.risk}</li>
                <li>• Aktif anomali sayısı: {selectedRoute.activeAnomaliesCount}</li>
              </ul>
            </div>

            <div className="rounded-xl border border-gray-700 bg-gray-900 p-5">
              <h5 className="text-white text-lg font-semibold mb-3">
                Dikkat Edilmesi Gerekenler
              </h5>
              <ul className="space-y-2 text-gray-300">
                <li>• Rota gerçek backend graph optimizasyonundan gelmektedir.</li>
                <li>• Enerji-risk ve anomali bilgileri karar maliyetine dahil edilir.</li>
                <li>• Alternatif rota oluşması için segment ağında farklı bağlantılar bulunmalıdır.</li>
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