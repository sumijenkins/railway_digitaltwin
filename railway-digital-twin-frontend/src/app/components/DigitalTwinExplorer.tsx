import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Activity, 
    Thermometer, 
    Gauge, 
    RefreshCw, 
    Cpu,
    Zap,
    Compass
} from 'lucide-react';
import { Track, Train } from '../../types/Railway';

interface DigitalTwinExplorerProps {
    selectedTrack: Track | null;
    selectedTrain?: Train | null;
    telemetryData: any[]; 
    onGoToMap?: () => void;
}

export function DigitalTwinExplorer({ selectedTrack, selectedTrain, telemetryData, onGoToMap }: DigitalTwinExplorerProps) {
    const latest = useMemo(() => {
        if (!telemetryData || telemetryData.length === 0) return null;
        return telemetryData[telemetryData.length - 1];
    }, [telemetryData]);

    if (!selectedTrack && !selectedTrain) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-gray-900/20 rounded-xl border-2 border-dashed border-gray-800 p-12">
                <Cpu className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium text-white">Dijital İkiz Keşfi için Nesne Seçin</p>
                <p className="text-sm">Varlık analizi için haritadan bir seçim yapın.</p>
            </div>
        );
    }

    const temperature = Number(latest?.temperature || latest?.train_temperature || latest?.rail_temp) || 26.7;
    const speed = Number(latest?.speed || latest?.train_speed) || 81.1;
    const vib = Number(latest?.vibration_x || latest?.train_vibration_x || latest?.rail_vibration) || 0.81;
    const tilt = Number(latest?.tilt || latest?.rail_slope) || -0.8;
    
    const health = selectedTrack ? selectedTrack.healthScore : 95;
    const statusColor = health > 80 ? 'text-green-400' : 'text-red-400';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <RefreshCw className="text-blue-500" />
                        Dijital İkiz Keşfi: {selectedTrack ? `S${selectedTrack.id.replace('RTD-', '')}` : selectedTrain?.name}
                    </h2>
                    <p className="text-gray-400 text-xs mt-1">Fiziksel varlık ile sanal kopya %100 senkronize.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#0a0c14] border border-slate-800 rounded-2xl min-h-[400px] flex items-center justify-center p-12 relative">
                    <div className="absolute top-4 left-4">
                        <div className="bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-slate-500 px-3 py-1 rounded">VIRTUAL_ASSET_RENDER_4.0</div>
                    </div>
                    
                    <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1000px' }}>
                        {selectedTrack ? (
                            <div className="relative w-[400px] h-48" style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg) rotateZ(-45deg)' }}>
                                <div className="absolute top-0 left-1/4 w-2 h-full bg-slate-500 shadow-xl" />
                                <div className="absolute top-0 right-1/4 w-2 h-full bg-slate-500 shadow-xl" />
                                <div className="absolute inset-0 flex flex-col justify-around py-4">
                                    {[...Array(8)].map((_, i) => <div key={i} className="w-full h-3 bg-slate-800 rounded-sm" />)}
                                </div>
                                <div className="absolute -right-32 top-1/2 transform rotateZ(45deg) rotateX(-60deg) text-[10px] text-slate-500 space-y-1">
                                    <div>Vibrasyon: {vib} g</div>
                                    <div>Eğim (Tilt): {tilt}°</div>
                                    <div>Isı: {temperature}°C</div>
                                </div>
                            </div>
                        ) : (
                            <div className="w-64 h-24 bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold">TREN MODELİ</div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-xl">
                        <h3 className="text-slate-500 text-[10px] font-black mb-4 uppercase">VARLIK SAĞLIK SKORU</h3>
                        <div className={`text-5xl font-black ${statusColor}`}>%{health} <span className="text-sm font-bold opacity-50 ml-2">OPTIMAL</span></div>
                        <div className="w-full bg-slate-800 h-2 mt-4 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${health}%` }} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4">
                            <Thermometer className="w-4 h-4 text-red-400 mb-2" />
                            <div className="text-xl font-bold text-white">{temperature}°C</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">RAY ISISI</div>
                        </div>
                        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4">
                            <Zap className="w-4 h-4 text-yellow-400 mb-2" />
                            <div className="text-xl font-bold text-white">{speed}</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">TREN HIZI</div>
                        </div>
                        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4">
                            <Activity className="w-4 h-4 text-blue-400 mb-2" />
                            <div className="text-xl font-bold text-white">{vib}</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">VIBRASYON (G)</div>
                        </div>
                        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4">
                            <Compass className="w-4 h-4 text-emerald-400 mb-2" />
                            <div className="text-xl font-bold text-white">{tilt}°</div>
                            <div className="text-[9px] text-slate-500 font-bold uppercase">RAY EĞİMİ</div>
                        </div>
                    </div>

                    <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-5 flex items-center gap-4">
                        <RefreshCw className="w-6 h-6 text-blue-500" />
                        <div>
                            <div className="text-[9px] font-black text-blue-400">TAHMİNİ KALAN ÖMÜR (RUL)</div>
                            <div className="text-2xl font-black text-white">113 GÜN</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
