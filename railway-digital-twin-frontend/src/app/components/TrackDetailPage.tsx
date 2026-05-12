import { ArrowRight, Activity, Thermometer, Gauge, Wind, Clock3, MapPin } from "lucide-react";
import { RailwayNetwork, Track } from "../../types/Railway";

interface TrackDetailPageProps {
  network: RailwayNetwork | null;
  selectedTrackId: string | null;
  selectedTrack: Track | null;
  onSelectTrackId: (id: string | null) => void;
}

export function TrackDetailPage({ network, selectedTrackId, selectedTrack, onSelectTrackId }: TrackDetailPageProps) {
  const tracks = network?.tracks || [];
  const sourceStation = selectedTrack
    ? network?.stations.find((s) => s.id === selectedTrack.sourceStationId)
    : null;
  const targetStation = selectedTrack
    ? network?.stations.find((s) => s.id === selectedTrack.targetStationId)
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-white text-2xl font-bold">Ray Detayı</h2>
          <p className="text-gray-400 mt-2 max-w-2xl">
            Haritadan veya açılır menüden bir ray segmenti seçerek dijital ikiz ile eşlenmiş gerçek zamanlı performans, sağlık ve bakım verilerini görüntüleyin.
          </p>
        </div>
        <div className="space-y-2 w-full md:w-80">
          <label className="text-gray-500 uppercase tracking-[0.2em] text-[10px] font-bold">Seçili Ray Segmenti</label>
          <select
            value={selectedTrackId ?? ""}
            onChange={(e) => onSelectTrackId(e.target.value || null)}
            className="w-full bg-slate-900 text-white p-3 rounded-xl border border-slate-700"
          >
            <option value="">Ray segmenti seçin</option>
            {tracks.map((track) => (
              <option key={track.id} value={track.id}>
                {track.id} — {track.sourceStationId.toUpperCase()} → {track.targetStationId.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
      {!selectedTrack ? (
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/70 p-12 text-center">
          <MapPin className="mx-auto mb-4 h-12 w-12 text-cyan-400 opacity-80" />
          <h3 className="text-white text-xl font-semibold mb-2">Bir ray seçin</h3>
          <p className="text-gray-400">Ray detaylarını görmek için haritadan veya açılır menüden bir segment seçin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.95fr] gap-6">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-6 shadow-xl overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent opacity-80 animate-pulse" />
              <div className="relative space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-sm uppercase tracking-[0.18em] text-cyan-300 font-bold">Segment</div>
                    <div className="text-3xl font-bold text-white mt-2">{selectedTrack.id}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 border border-slate-700 px-4 py-3 text-sm text-gray-300">
                    {selectedTrack.status.toUpperCase()}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-3xl bg-slate-900/95 border border-slate-700 p-5">
                    <div className="flex items-center gap-2 text-gray-400 uppercase tracking-[0.18em] text-[10px] font-bold mb-3">Kaynak</div>
                    <div className="text-lg text-white font-semibold">{sourceStation?.name ?? selectedTrack.sourceStationId}</div>
                  </div>
                  <div className="rounded-3xl bg-slate-900/95 border border-slate-700 p-5">
                    <div className="flex items-center gap-2 text-gray-400 uppercase tracking-[0.18em] text-[10px] font-bold mb-3">Hedef</div>
                    <div className="text-lg text-white font-semibold">{targetStation?.name ?? selectedTrack.targetStationId}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-3xl bg-slate-900/95 border border-slate-700 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">Mesafe</div>
                    <div className="text-2xl font-bold text-white">{selectedTrack.distance} km</div>
                  </div>
                  <div className="rounded-3xl bg-slate-900/95 border border-slate-700 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">Hız Limiti</div>
                    <div className="text-2xl font-bold text-white">{selectedTrack.speedLimit} km/h</div>
                  </div>
                  <div className="rounded-3xl bg-slate-900/95 border border-slate-700 p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">Sağlık</div>
                    <div className="text-2xl font-bold text-white">%{selectedTrack.healthScore}</div>
                  </div>
                </div>
                <div className="rounded-3xl bg-slate-900/95 border border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">İnceleme Tarihi</p>
                      <p className="text-white font-semibold mt-2">{selectedTrack.lastInspectionDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Toplam Tonaj</p>
                      <p className="text-white font-semibold mt-2">{selectedTrack.accumulatedTonnage.toLocaleString()} Ton</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">
                        <span>Hat Sağlığı</span>
                        <span className="text-white font-bold">%{selectedTrack.healthScore}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                          style={{ width: `${selectedTrack.healthScore}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs uppercase tracking-[0.18em] text-gray-400 mb-2">
                        <span>Eğim</span>
                        <span className="text-white font-bold">{selectedTrack.gradient}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-cyan-400 transition-all duration-700"
                          style={{ width: `${Math.min(100, selectedTrack.gradient * 15)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-6 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Telemetri Özeti</p>
                    <h3 className="text-white text-xl font-bold mt-2">Gerçek Zamanlı Durum</h3>
                  </div>
                  <div className="rounded-full bg-slate-900 border border-slate-700 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-cyan-300">Güncel</div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-3xl bg-slate-900/90 border border-slate-700 p-5 text-center">
                    <Thermometer className="mx-auto mb-3 w-5 h-5 text-red-400" />
                    <div className="text-white text-3xl font-bold">{selectedTrack.telemetry?.axleTemp ?? 0}°C</div>
                    <p className="text-gray-400 text-sm mt-2">Ray sıcaklığı</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 border border-slate-700 p-5 text-center">
                    <Activity className="mx-auto mb-3 w-5 h-5 text-blue-400" />
                    <div className="text-white text-3xl font-bold">{selectedTrack.telemetry?.vibrationLevel ?? 0}</div>
                    <p className="text-gray-400 text-sm mt-2">Titreşim</p>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 border border-slate-700 p-5 text-center">
                    <Wind className="mx-auto mb-3 w-5 h-5 text-emerald-400" />
                    <div className="text-white text-3xl font-bold">{Math.round((selectedTrack.telemetry?.trafficDensity ?? 0) * 100)}%</div>
                    <p className="text-gray-400 text-sm mt-2">Trafik Yoğunluğu</p>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-900/90 border border-slate-700 p-5 flex items-center gap-4">
                    <Gauge className="w-6 h-6 text-yellow-400" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Çalışma Hızı Tahmini</p>
                      <p className="text-white font-semibold text-lg">{selectedTrack.speedLimit - 10} km/h</p>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-slate-900/90 border border-slate-700 p-5 flex items-center gap-4">
                    <Clock3 className="w-6 h-6 text-cyan-400" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Bakım Zamanı</p>
                      <p className="text-white font-semibold text-lg">{selectedTrack.healthScore < 70 ? "Yakında" : "1-2 ay"}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-slate-700 bg-slate-950/70 p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <ArrowRight className="w-5 h-5 text-blue-400" />
                  <p className="text-sm uppercase tracking-[0.18em] text-gray-400">Önerilen Eylemler</p>
                </div>
                <ul className="space-y-3 text-gray-300">
                  <li className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-sm font-semibold">Aşırı sıcaklık algılandı</p>
                    <p className="text-xs text-gray-500 mt-1">Ray sıcaklığı %10 artmış, bakım öncelikli.</p>
                  </li>
                  <li className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
                    <p className="text-sm font-semibold">Titreşim değerleri normal</p>
                    <p className="text-xs text-gray-500 mt-1">Vibrasyon düzeyi nominal aralıkta.</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}