import { Activity, Clock, Zap, AlertCircle, TrendingUp } from "lucide-react";

interface AnalyticsProps {
    routeResult: any;
    trainLoad: number;
}

export function OperationalAnalytics({ routeResult, trainLoad }: AnalyticsProps) {
    if (!routeResult?.result) return null;

    const { totalCost, path } = routeResult.result;
    const distance = path.reduce((acc: number, t: any) => acc + t.distance, 0);

    // Simulated KPI Logic
    const efficiency = Math.max(70, 100 - (totalCost - distance) / 5);
    const wearRisk = trainLoad > 1000 ? "YÜKSEK" : (totalCost / distance > 1.2 ? "ORTA" : "DÜŞÜK");
    const delayRisk = path.some((t: any) => t.status === 'maintenance') ? "15 DK GECİKME" : "ZAMANINDA";

    return (
        <div className="bg-[#1a1f26] rounded-xl border border-gray-700 overflow-hidden shadow-2xl">
            <div className="bg-gray-800/50 p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                    <TrendingUp className="text-blue-400 w-4 h-4" />
                    Operasyonel Analiz & Karar Destek
                </h3>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30 font-bold">CANLI</span>
            </div>

            <div className="p-6">
                {/* KPI GRID */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] mb-1 font-bold">
                            <Zap className="w-3 h-3" /> VERİMLİLİK
                        </div>
                        <div className="text-2xl font-mono text-green-400">%{efficiency.toFixed(1)}</div>
                    </div>
                    <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] mb-1 font-bold">
                            <Activity className="w-3 h-3" /> HAT AŞINMA RİSKİ
                        </div>
                        <div className={`text-xl font-bold ${wearRisk === 'YÜKSEK' ? 'text-red-500' : 'text-blue-400'}`}>{wearRisk}</div>
                    </div>
                    <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-800">
                        <div className="flex items-center gap-2 text-gray-500 text-[10px] mb-1 font-bold">
                            <Clock className="w-3 h-3" /> TAHMİNİ VARAŞ
                        </div>
                        <div className="text-xl font-bold text-yellow-400">{delayRisk}</div>
                    </div>
                </div>

                {/* DECISION REASONING */}
                <div className="space-y-4">
                    <h4 className="text-gray-400 text-[10px] font-bold uppercase trekking-wider border-l-2 border-blue-500 pl-2">Yapay Zeka Karar Gerekçesi</h4>

                    <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex gap-3">
                            <AlertCircle className="text-blue-400 w-5 h-5 mt-1 shrink-0" />
                            <div className="text-sm text-gray-300 leading-relaxed">
                                System bugün <strong>{routeResult.startStation} → {routeResult.endStation}</strong> rotası için <strong>{trainLoad} ton</strong> yükü simüle etti.
                                {trainLoad > 1000 ? (
                                    <p className="mt-2 text-yellow-500 bg-yellow-900/20 p-2 rounded text-xs border border-yellow-500/10">
                                        ⚠️ Uyarı: Yüksek yük (1000t+) tespiti. Eğimli arazilerde (Soma-Balıkesir hattı) frenleme ve çekiş gücü optimizasyonu aktif edildi.
                                    </p>
                                ) : (
                                    <p className="mt-2 text-green-500 bg-green-900/20 p-2 rounded text-xs border border-green-500/10">
                                        ✓ Verimlilik: Mevcut yük profiliyle hat üzerindeki tüm segmentlerde tam sürat (120 km/s) operasyonu planlandı.
                                    </p>
                                )}

                                {path.some((t: any) => t.status === 'closed') && (
                                    <p className="mt-2 text-red-500 bg-red-900/20 p-2 rounded text-xs border border-red-500/30">
                                        🚨 KRİTİK: Birincil hat üzerinde kapalı segment (Bakım/Kaza) tespit edildi. Sistem otomatik olarak alternatif B planını devreye aldı.
                                    </p>
                                )}

                                {path.some((t: any) => t.healthScore < 60) && (
                                    <p className="mt-2 text-orange-400 bg-orange-900/20 p-2 rounded text-xs border border-orange-500/20">
                                        ⚠️ UYARI: Rotada düşük sağlık puanlı (%60 altı) raylar bulunuyor. Ağır yük geçişlerinde ray yorulması hızlanabilir.
                                    </p>
                                )}

                                {path.some((t: any) => t.telemetry?.axleTemp > 65) && (
                                    <p className="mt-2 text-red-400 bg-red-900/20 p-2 rounded text-xs border border-red-500/30">
                                        🚨 KRİTİK SICAKLIK: Rota üzerinde 65°C üzeri ısı tespit edildi. Yangın veya ray genleşme riski nedeniyle sürat kısıtlaması elzemdir.
                                    </p>
                                )}

                                {path.some((t: any) => t.telemetry?.vibrationLevel > 6) && (
                                    <p className="mt-2 text-yellow-400 bg-yellow-900/10 p-2 rounded text-xs border border-yellow-500/20">
                                        ⚡ IoT TESPİTİ: Belirli segmentlerde yüksek titreşim (6g+) ölçüldü. Balast aşınması veya gevşek bağlantı şüphesi saptandı.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-gray-500 italic px-2">
                        <span>Toplam Mesafe: {distance} KM</span>
                        <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                        <span>Enerji Katsayısı: {(totalCost / distance).toFixed(2)}x</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
