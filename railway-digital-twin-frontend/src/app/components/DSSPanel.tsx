import { AlertTriangle, CheckCircle, Route, Wrench, Brain } from "lucide-react";

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
          Decision Support System
        </h3>
        <p className="text-gray-400 text-sm">DSS verisi yükleniyor...</p>
      </div>
    );
  }

  const statusColor =
    overview.overallStatus === "CRITICAL"
      ? "text-red-400"
      : overview.overallStatus === "WARNING"
        ? "text-yellow-400"
        : "text-green-400";

  const statusBorder =
    overview.overallStatus === "CRITICAL"
      ? "border-red-500/40 bg-red-500/10"
      : overview.overallStatus === "WARNING"
        ? "border-yellow-500/40 bg-yellow-500/10"
        : "border-green-500/40 bg-green-500/10";

  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-white text-lg font-bold flex items-center gap-2">
          <Brain className="text-purple-400 w-5 h-5" />
          Decision Support System
        </h3>

        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBorder} ${statusColor}`}>
          {overview.overallStatus}
        </span>
      </div>

      <p className="text-gray-300 text-sm leading-relaxed">
        {overview.summary}
      </p>

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
          Route Recommendation
        </h4>

        <p className="text-blue-300 font-mono text-sm mb-2">
          {routeReport.selectedRoute}
        </p>

        <p className="text-gray-400 text-xs leading-relaxed">
          {routeReport.reason}
        </p>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <h4 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-yellow-400" />
          Maintenance Priority
        </h4>

        {overview.maintenancePriorityList?.length > 0 ? (
          <div className="space-y-3">
            {overview.maintenancePriorityList.map((item: any, index: number) => (
              <div key={index} className="flex gap-3 items-start border-b border-gray-700/50 pb-3 last:border-b-0 last:pb-0">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-white text-sm font-semibold">{item.action}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.reason}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-2 items-center text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            No urgent maintenance action required.
          </div>
        )}
      </div>
    </div>
  );
}