import { Thermometer, Activity, Zap, Info, ArrowRight } from "lucide-react";
import { Track } from "../../types/Railway";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
    track: Track | null;
}

export function SensorInsightPanel({ track }: Props) {
    if (!track) {
        return (
            <div className="bg-[#1a1f26] rounded-xl border border-gray-700 p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
                <Info className="w-12 h-12 text-gray-600 mb-4" />
                <h3 className="text-gray-400 font-bold mb-2 uppercase text-xs tracking-widest">Sensör Verisi Seçilmedi</h3>
                <p className="text-gray-600 text-[10px]">Detaylı telemetri ve IoT analizi için harita üzerinden bir hat segmentine tıklayın.</p>
            </div>
        );
    }

    // Generate some realistic historical sensor trend data
    const data = Array.from({ length: 20 }, (_, i) => ({
        time: `${14 + Math.floor(i / 10)}:${(i % 10) * 6}`,
        temp: (track.telemetry?.axleTemp || 40) + Math.sin(i * 0.5) * 5 + (Math.random() * 2),
        vib: (track.telemetry?.vibrationLevel || 3) + Math.cos(i * 0.5) * 1.5 + (Math.random() * 0.5)
    }));

    const isAnomaly = (track.telemetry?.axleTemp || 0) > 65 || (track.telemetry?.vibrationLevel || 0) > 6;

    return (
        <div className="bg-[#1a1f26] rounded-xl border border-gray-700 overflow-hidden shadow-2xl flex flex-col min-h-[300px]">
            <div className="bg-gray-800/50 p-4 border-b border-gray-700 flex items-center justify-between">
                <div>
                    <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                        <Zap className="text-blue-400 w-4 h-4" />
                        IoT Segment Teşhisi
                    </h3>
                    <div className="text-[9px] text-gray-500 font-mono mt-0.5">SEGMENT_ID: {track.id} | {track.distance} KM</div>
                </div>
                <div className={`px-2 py-0.5 rounded text-[9px] font-bold border ${isAnomaly ? 'bg-red-500/20 text-red-500 border-red-500/30 animate-pulse' : 'bg-green-500/20 text-green-500 border-green-500/30'}`}>
                    {isAnomaly ? 'ANOMALİ TESPİTİ' : 'DURUM: NOMİNAL'}
                </div>
            </div>

            <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                {/* LIVE READINGS */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 text-gray-500 text-[9px] font-bold mb-1 uppercase">
                            <Thermometer className="w-3 h-3 text-red-400" /> Aks Isısı
                        </div>
                        <div className="text-xl font-mono text-white">{track.telemetry?.axleTemp.toFixed(1)}°C</div>
                        <div className="w-full bg-gray-800 h-1 rounded-full mt-2 overflow-hidden">
                            <div className="bg-red-500 h-full" style={{ width: `${Math.min(100, (track.telemetry?.axleTemp || 0))} %` }}></div>
                        </div>
                    </div>
                    <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 text-gray-500 text-[9px] font-bold mb-1 uppercase">
                            <Activity className="w-3 h-3 text-blue-400" /> Titreşim G-Kuvveti
                        </div>
                        <div className="text-xl font-mono text-white">{track.telemetry?.vibrationLevel.toFixed(2)}g</div>
                        <div className="w-full bg-gray-800 h-1 rounded-full mt-2 overflow-hidden">
                            <div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (track.telemetry?.vibrationLevel || 0) * 10)} %` }}></div>
                        </div>
                    </div>
                </div>

                {/* TREND CHART */}
                <div className="h-40 bg-black/20 p-2 rounded-lg border border-gray-800">
                    <div className="text-[9px] text-gray-500 font-bold mb-2 uppercase flex justify-between">
                        <span>Zaman Serisi Analizi (Trend)</span>
                        <span className="text-blue-400">Canlı Akış</span>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                            <XAxis dataKey="time" hide />
                            <YAxis hide domain={['auto', 'auto']} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a202c', border: '1px solid #4a5568', fontSize: '10px' }}
                                itemStyle={{ color: '#cbd5e0' }}
                            />
                            <Line type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="vib" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* AI INSIGHT */}
                <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                        <Info className="w-3 h-3 text-blue-400 mt-1" />
                        <div className="text-[10px] text-gray-400 leading-relaxed italic">
                            <strong>IoT Korelasyonu:</strong> {isAnomaly
                                ? "Yüksek ısı ve titreşim saptandı. Rulman yorulması veya ray raydan çıkma riski %15 arttı. Görsel denetim önerilir."
                                : "Isı ve titreşim değerleri doğrusal bir uyum içerisinde. Ray yüzey teması ideal seviyede."}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
