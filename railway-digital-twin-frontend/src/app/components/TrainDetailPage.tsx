import { Percent, Thermometer, Activity, Clock3, MapPin, Train } from "lucide-react";
import { RailwayNetwork, Train as TrainType } from "../../types/Railway";

interface TrainDetailPageProps {
  trains: TrainType[];
  selectedTrainId: string | null;
  selectedTrain: TrainType | null;
  network: RailwayNetwork | null;
  sensorData: any[];
  onSelectTrainId: (id: string | null) => void;
}

export function TrainDetailPage({
  trains,
  selectedTrainId,
  selectedTrain,
  network,
  sensorData,
  onSelectTrainId,
}: TrainDetailPageProps) {
  const currentStation = selectedTrain
    ? network?.stations.find((s) => s.id === selectedTrain.currentStationId)
    : null;
  const destinationStation = selectedTrain
    ? network?.stations.find((s) => s.id === selectedTrain.destinationStationId)
    : null;

  const latest = sensorData[sensorData.length - 1] || {};
  const speed = latest.speed ?? 76;
  const temp = latest.trainTemp ?? 57;
  const vibration = latest.trainVib ?? 1.8;

  const capacityUsage = selectedTrain
    ? Math.min(100, Math.round((selectedTrain.totalLoad / selectedTrain.maxLoad) * 100))
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Tren Detayı</h2>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Kullanıcının seçtiği treni seçip dijital ikiz animasyonları ve kritik performans metrikleri ile takip edin.
          </p>
        </div>

        <div className="space-y-2 w-full md:w-80">
          <label className="text-gray-500 uppercase tracking-[0.2em] text-[10px] font-bold">Seçili Tren</label>
          <select
            value={selectedTrainId ?? ""}
            onChange={(e) => onSelectTrainId(e.target.value || null)}
            className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-700"
          >
            <option value="">Tren seçin</option>
            {trains.map((train) => (
              <option key={train.id} value={train.id}>
                {train.name} ({train.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedTrain ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-12 text-center">
          <Train className="mx-auto mb-4 h-12 w-12 text-violet-400 opacity-80" />
          <h3 className="text-white text-xl font-semibold mb-2">Bir tren seçin</h3>
          <p className="text-gray-400">Tren verilerini ve animasyonlu dijital ikiz görünümünü açmak için bir tren seçin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.95fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-6 shadow-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-transparent opacity-80 animate-pulse" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm uppercase tracking-[0.18em] text-violet-300 font-bold">Tren</div>
                    <div className="text-3xl font-bold text-white mt-2">{selectedTrain.name}</div>
                    <div className="text-sm text-gray-400 mt-1">{selectedTrain.id}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 border border-slate-700 px-4 py-3 text-sm text-gray-300">
                    Karbon Performansı
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-3xl bg-slate-900/95 border border-slate-700 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">Yük</div>
                    <div className="text-2xl font-bold text-white">{selectedTrain.totalLoad} Ton</div>
                  </div>
                  <div className="rounded-3xl bg-slate-900/95 border border-slate-700 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">Maksimum</div>
                    <div className="text-2xl font-bold text-white">{selectedTrain.maxLoad} Ton</div>
                  </div>
                  <div className="rounded-3xl bg-slate-900/95 border border-slate-700 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">Doluluk</div>
                    <div className="text-2xl font-bold text-white">%{capacityUsage}</div>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-900/95 border border-slate-700 p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">Mevcut Durak</div>
                      <div className="text-white font-semibold text-lg">{currentStation?.name ?? selectedTrain.currentStationId}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">Hedef Durak</div>
                      <div className="text-white font-semibold text-lg">{destinationStation?.name ?? selectedTrain.destinationStationId}</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-3xl bg-slate-900 border border-slate-700 p-5 text-center">
                <Thermometer className="mx-auto mb-3 w-5 h-5 text-red-400" />
                <div className="text-white text-3xl font-bold">{temp}°C</div>
                <p className="text-gray-400 text-sm mt-2">Motor / Vagon Sıcaklığı</p>
              </div>
              <div className="rounded-3xl bg-slate-900 border border-slate-700 p-5 text-center">
                <Activity className="mx-auto mb-3 w-5 h-5 text-blue-400" />
                <div className="text-white text-3xl font-bold">{speed} km/h</div>
                <p className="text-gray-400 text-sm mt-2">Gerçek Zamanlı Hız</p>
              </div>
              <div className="rounded-3xl bg-slate-900 border border-slate-700 p-5 text-center">
                <Activity className="mx-auto mb-3 w-5 h-5 text-emerald-400" />
                <div className="text-white text-3xl font-bold">{vibration}</div>
                <p className="text-gray-400 text-sm mt-2">Titreşim</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Güzergah Bilgisi</p>
                  <h3 className="text-white text-lg font-bold mt-2">Tahmini Rota</h3>
                </div>
                <div className="rounded-full bg-slate-900/90 border border-slate-700 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-fuchsia-300">Canlı</div>
              </div>
              <div className="space-y-3">
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-gray-400">Kalkış</div>
                    <div className="text-white font-semibold">{currentStation?.name ?? selectedTrain.currentStationId}</div>
                  </div>
                  <div className="text-white text-sm font-semibold">→</div>
                  <div>
                    <div className="text-sm text-gray-400">Varış</div>
                    <div className="text-white font-semibold">{destinationStation?.name ?? selectedTrain.destinationStationId}</div>
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4">
                  <div className="flex items-center gap-3 text-gray-400 uppercase tracking-[0.18em] text-[10px] mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>Beklenen Çıkış Süresi</span>
                  </div>
                  <p className="text-white font-semibold">{Math.max(12, Math.round((selectedTrain.totalLoad / selectedTrain.maxLoad) * 50))} dk</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <Percent className="w-5 h-5 text-cyan-400" />
              <p className="text-sm uppercase tracking-[0.18em] text-gray-400">Performans Özetleri</p>
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Doluluk Oranı</p>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-cyan-400 transition-all duration-700" style={{ width: `${capacityUsage}%` }} />
                </div>
                <p className="text-right text-white text-sm font-semibold mt-2">%{capacityUsage}</p>
              </div>
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Hız Stabilitesi</p>
                <div className="text-white text-2xl font-bold">{speed > 80 ? "Yüksek" : speed > 65 ? "Orta" : "Düşük"}</div>
              </div>
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">Güvenlik & Bakım</p>
                <div className="text-white text-2xl font-bold">{capacityUsage > 90 ? "Öncelikli" : "Normal"}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
