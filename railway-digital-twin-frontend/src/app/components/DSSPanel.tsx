import {
  AlertTriangle,
  CheckCircle,
  Route,
  Wrench,
  Brain,
  Activity,
  FileText,
  Lightbulb,
} from "lucide-react";

type DSSPanelProps = {
  overview: any;
  routeReport: any;
};

export function DSSPanel({ overview, routeReport }: DSSPanelProps) {
  if (!overview || !routeReport) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
        <h3 className="text-white text-lg font-bold mb-2 flex items-center gap-2">
          <Brain className="text-purple-400 w-5 h-5" />
          Karar Destek Sistemi
        </h3>
        <p className="text-gray-400 text-sm">DSS verisi yükleniyor...</p>
      </div>
    );
  }

  const statusColor =
    overview.overallStatus === "CRITICAL"
      ? "text-red-400 border-red-500/40 bg-red-500/10"
      : overview.overallStatus === "WARNING"
        ? "text-yellow-400 border-yellow-500/40 bg-yellow-500/10"
        : "text-green-400 border-green-500/40 bg-green-500/10";

  const topSegments = overview.segmentReports?.slice(0, 3) ?? [];

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white text-lg font-bold flex items-center gap-2">
            <Brain className="text-purple-400 w-5 h-5" />
            Karar Destek Sistemi
          </h3>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
            {overview.overallStatus}
          </span>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <p className="text-gray-300 text-sm leading-relaxed">
            {overview.summary}
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Generated at: {overview.generatedAt}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-500 text-xs uppercase font-bold">Critical</p>
            <p className="text-red-400 text-2xl font-bold">{overview.criticalCount}</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-500 text-xs uppercase font-bold">Warning</p>
            <p className="text-yellow-400 text-2xl font-bold">{overview.warningCount}</p>
          </div>

          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-500 text-xs uppercase font-bold">Normal</p>
            <p className="text-green-400 text-2xl font-bold">{overview.normalCount}</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <Route className="w-4 h-4 text-blue-400" />
            DSS Rota Önerisi
          </h4>

          <p className="text-blue-300 font-mono text-sm mb-2">
            {routeReport.selectedRoute}
          </p>

          <p className="text-gray-400 text-xs leading-relaxed">
            {routeReport.reason}
          </p>

          <p className="text-yellow-300 text-xs leading-relaxed mt-3">
            {routeReport.recommendedAction}
          </p>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-yellow-400" />
            Bakım Öncelikleri
          </h4>

          {overview.maintenancePriorityList?.length > 0 ? (
            <div className="space-y-3">
              {overview.maintenancePriorityList.map((item: any, index: number) => (
                <div
                  key={index}
                  className="border-b border-gray-700/50 pb-3 last:border-b-0 last:pb-0"
                >
                  <p className="text-white text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    {item.action}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">{item.reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-2 items-center text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Şu anda acil bakım gerekmemektedir.
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
        <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
          <Activity className="text-cyan-400 w-5 h-5" />
          DSS Segment Analizi
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {topSegments.map((segment: any) => (
            <div key={segment.segmentId} className="bg-gray-900 rounded-lg p-4 border border-gray-700 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-bold">{segment.segmentId}</h4>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-bold ${
                    segment.severity === "CRITICAL"
                      ? "bg-red-500/20 text-red-400"
                      : segment.severity === "WARNING"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                  }`}
                >
                  {segment.severity}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-800 rounded p-2">
                  <p className="text-gray-500">Risk Skoru</p>
                  <p className="text-white font-bold">{segment.riskScore}</p>
                </div>
                <div className="bg-gray-800 rounded p-2">
                  <p className="text-gray-500">Enerji Etkisi</p>
                  <p className="text-white font-bold">{segment.estimatedEnergyImpact}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs font-bold mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Yönetici Özeti
                </p>
                <p className="text-gray-300 text-xs leading-relaxed">
                  {segment.executiveSummary}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-xs font-bold mb-2 flex items-center gap-1">
                  <Brain className="w-3 h-3" />
                  Özellik Katkıları
                </p>

                <div className="space-y-2">
                  {segment.featureContributions?.map((f: any, idx: number) => (
                    <div key={idx} className="bg-gray-800 rounded p-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white">{f.feature}</span>
                        <span
                          className={
                            f.impact === "HIGH"
                              ? "text-red-400"
                              : f.impact === "MEDIUM"
                                ? "text-yellow-400"
                                : "text-green-400"
                          }
                        >
                          {f.impact}
                        </span>
                      </div>
                      <p className="text-gray-500 text-[11px] mt-1">
                        {f.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                <p className="text-cyan-400 text-xs font-bold mb-2">
                  RUL Tahmini
                </p>

                <div className="space-y-1 text-xs">
                  <p className="text-gray-300">
                    Kalan Ömür:
                    <span className="text-white ml-2 font-bold">
                      {segment.executiveSummary?.match(/RUL tahmini: ([^ ]+)/)?.[1]} gün
                    </span>
                  </p>

                  <p className="text-gray-300">
                    Bozulma Trendi:
                    <span className="text-yellow-300 ml-2 font-bold">
                      {segment.executiveSummary?.includes("KARARLI")
                        ? "KARARLI"
                        : segment.executiveSummary?.includes("KÖTÜLEŞİYOR")
                          ? "KÖTÜLEŞİYOR"
                          : "BİLİNMİYOR"}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-xs font-bold mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Öneriler
                </p>
                <p className="text-yellow-200 text-xs leading-relaxed">
                  {segment.maintenanceRecommendation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}