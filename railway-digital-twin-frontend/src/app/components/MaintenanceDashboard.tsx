import { Wrench, AlertTriangle, Calendar, Info } from "lucide-react";
import { RailwayNetwork, Track } from "../../types/Railway";
import { useEffect, useState } from "react";
import { rulService, RulPrediction } from "../../services/rulService";

interface Props {
    network: RailwayNetwork | null;
}

export function MaintenanceDashboard({ network }: Props) { 

    const [rulPredictions, setRulPredictions] =
    useState<Record<string, RulPrediction>>({});

    const [loadingRul, setLoadingRul] = useState(true);

    useEffect(() => {
        if (!network) return;

        const fetchRulForAllSegments = async () => {
            try {
                setLoadingRul(true);

                const results = await Promise.all(
                    network.tracks.map(async (track) => {
                        const prediction = await rulService.predictRulForSegment(track.id.toUpperCase());

                        return {
                            segmentId: track.id,
                            prediction,
                        };
                    })
                );

                const predictionMap: Record<string, RulPrediction> = {};

                results.forEach((item) => {
                    predictionMap[item.segmentId] = item.prediction;
                });

                setRulPredictions(predictionMap);
            } catch (err) {
                console.error("RUL ERROR:", err);
            } finally {
                setLoadingRul(false);
            }
        };

        fetchRulForAllSegments();
    }, [network]);

    if (!network) return null;

    const getUrgencyColor = (score: number) => {
        if (score < 50) return 'text-red-500 bg-red-500/10 border-red-500/20';
        if (score < 70) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
    };

    const priorityTracks = [...network.tracks]
        .filter(
            (t, _, arr) =>
                !t.id.endsWith("-R") ||
                !arr.some((x) => x.id === t.id.replace("-R", ""))
        )
        .sort((a, b) => {
            const predA = rulPredictions[a.id] ?? rulPredictions[a.id + "-R"];
            const rulDaysA = predA && predA.remainingLifeDays !== undefined
                ? predA.remainingLifeDays
                : Math.max(3, (a.healthScore - 40) * 1.5);

            const predB = rulPredictions[b.id] ?? rulPredictions[b.id + "-R"];
            const rulDaysB = predB && predB.remainingLifeDays !== undefined
                ? predB.remainingLifeDays
                : Math.max(3, (b.healthScore - 40) * 1.5);

            return rulDaysA - rulDaysB;
        });

    return (
        <div className="bg-[#1a1f26] rounded-xl border border-gray-700 overflow-hidden shadow-2xl min-h-[300px]">
            <div className="bg-gray-800/50 p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-white font-bold flex items-center gap-2 text-sm uppercase tracking-widest">
                    <Wrench className="text-yellow-400 w-4 h-4" />
                    Öngörülü Bakım Planlayıcı (RUL)
                </h3>
                <span className="text-[10px] text-gray-500 font-mono">TCDD-PRM-v1</span>
            </div>

            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
                
                {priorityTracks.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 text-sm italic">
                        Tüm hatlar nominal değerde. Bakım gereği saptanmadı.
                    </div>
                ) : (
                    priorityTracks.map(track => {
                        const segmentRul = rulPredictions[track.id];
                        return (
                            <div key={track.id} className={`p-4 rounded-lg border flex flex-col gap-3 ${getUrgencyColor(track.healthScore)}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-bold text-sm tracking-tight">{track.id.toUpperCase()} Hattı</div>
                                        <div className="text-[10px] opacity-70">Son Denetim: {track.lastInspectionDate}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-mono font-bold">%{track.healthScore}</div>
                                        <div className="text-[9px] uppercase font-bold">Sağlık Puanı</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-1">
                                    <div className="bg-black/20 p-2 rounded flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        <div className="text-[10px]">
                                            <span className="block opacity-60 uppercase">Tahmini Bakım</span>
                                            <span className="font-bold font-mono">
                                                {segmentRul
                                                    ? `${Number(segmentRul.remainingLifeDays).toFixed(2)} GÜN`
                                                    : track.healthScore < 50
                                                    ? "ACİL"
                                                    : "Veri bekleniyor"}
                                                </span>
                                        </div>
                                    </div>
                                    <div className="bg-black/20 p-2 rounded flex items-center gap-2">
                                        <Info className="w-3 h-3" />
                                        <div className="text-[10px]">
                                            <span className="block opacity-60 uppercase">Yük Birikimi</span>
                                            <span className="font-bold font-mono">{(track.accumulatedTonnage / 1000000).toFixed(1)}M Ton</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-black/20 p-3 rounded border border-white/10 text-[10px] space-y-2">
                                    <div className="flex justify-between">
                                        <span className="opacity-60">RUL</span>
                                        <span className="font-bold text-cyan-300">
                                            {loadingRul
                                                ? "Yükleniyor..."
                                                : segmentRul
                                                    ? `${Number(segmentRul.remainingLifeDays).toFixed(2)} gün`
                                                    : "Veri yok"}
                                        </span>
                                    </div>

                                    {segmentRul && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="opacity-60">Güven Aralığı</span>
                                                <span className="font-bold text-blue-300">
                                                    {Number(segmentRul.confidenceLowerBound).toFixed(2)} - {Number(segmentRul.confidenceUpperBound).toFixed(2)} gün
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="opacity-60">Trend</span>
                                                <span className="font-bold text-orange-300">
                                                    {segmentRul.degradationTrend}
                                                </span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="opacity-60">Öncelik</span>
                                                <span className="font-bold text-red-300">
                                                    {segmentRul.maintenancePriority}
                                                </span>
                                            </div>

                                            <p className="text-gray-300 border-t border-white/10 pt-2">
                                                {segmentRul.recommendedAction}
                                            </p>
                                        </>
                                    )}
                                </div>

                                {track.healthScore < 50 && (
                                    <div className="flex items-center gap-2 text-[10px] bg-red-500 text-white p-1.5 rounded animate-pulse justify-center">
                                        <AlertTriangle className="w-3 h-3" />
                                        YÜKSEK RİSK: HIZ KISITLAMASI ÖNERİLİR (40 KM/S)
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <div className="bg-gray-800/30 p-3 border-t border-gray-700 text-[9px] text-gray-500">
                * Tahmini bakım verisi; AI/RUL modeli çıktısından alınmaktadır. Backend veri yoksa sağlık puanına dayalı yaklaşık değer kullanılır.
            </div>
        </div>
    );
}
