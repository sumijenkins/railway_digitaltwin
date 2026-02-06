import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface Anomaly {
  time: string;
  type: string;
  severity: "yüksek" | "orta" | "düşük";
  location: string;
  value: string;
  status: "aktif" | "izleniyor" | "çözüldü";
}

interface AnomalyTimelineProps {
  anomalies?: Anomaly[];
}

export function AnomalyTimeline({ anomalies = [] }: AnomalyTimelineProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "yüksek": return "bg-red-900/10 border-red-500/20";
      case "orta": return "bg-yellow-900/10 border-yellow-500/20";
      case "düşük": return "bg-blue-900/10 border-blue-500/20";
      default: return "bg-gray-900/10 border-gray-500/20";
    }
  };

  const getSeverityTagColor = (severity: string) => {
    switch (severity) {
      case "yüksek": return "text-red-400 border-red-400";
      case "orta": return "text-yellow-400 border-yellow-400";
      case "düşük": return "text-blue-400 border-blue-400";
      default: return "text-gray-400 border-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aktif": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "izleniyor": return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "çözüldü": return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <XCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="bg-[#1a1f26] rounded-xl p-6 border border-gray-800 shadow-xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          Anomali Tespit Zaman Çizelgesi
        </h3>
        <span className="text-xs text-gray-500 font-mono uppercase tracking-widest bg-gray-900 px-2 py-1 rounded border border-gray-800">
          Canlı İzleme
        </span>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {anomalies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-900/30 rounded-lg border border-dashed border-gray-800">
            <CheckCircle className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">Anu an için herhangi bir anomali tespit edilmedi.</p>
            <p className="text-xs opacity-50">Sistem normal değerler içerisinde çalışıyor.</p>
          </div>
        ) : (
          anomalies.map((anomaly, idx) => (
            <div
              key={idx}
              className={`border rounded-lg p-4 transition-all hover:bg-opacity-50 ${getSeverityColor(anomaly.severity)} animate-in fade-in slide-in-from-left-4 duration-300`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">{getStatusIcon(anomaly.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-white font-bold text-sm">{anomaly.type}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 border rounded uppercase tracking-wider ${getSeverityTagColor(anomaly.severity)}`}>
                        {anomaly.severity}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 leading-relaxed font-mono">
                      {anomaly.location} <span className="mx-1.5 text-gray-700">|</span> <span className="text-gray-300 font-bold">Değer: {anomaly.value}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500 font-mono font-bold bg-gray-900/50 px-2 py-1 rounded tabular-nums border border-gray-800">
                  {anomaly.time}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
