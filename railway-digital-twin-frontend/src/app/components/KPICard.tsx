import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export function KPICard({ title, value, icon: Icon, trend, trendUp, color = "blue" }: KPICardProps) {
  const colorClasses = {
    blue: "from-blue-600 to-blue-700",
    green: "from-green-600 to-green-700",
    red: "from-red-600 to-red-700",
    yellow: "from-yellow-600 to-yellow-700",
    purple: "from-purple-600 to-purple-700",
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm mb-2">{title}</p>
          <p className="text-white text-3xl mb-1">{value}</p>
          {trend && (
            <div className={`text-sm ${trendUp ? "text-green-400" : "text-red-400"}`}>
              {trendUp ? "↑" : "↓"} {trend}
            </div>
          )}
        </div>
        <div className={`bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}
