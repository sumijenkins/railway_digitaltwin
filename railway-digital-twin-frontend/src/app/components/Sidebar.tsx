import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  Wrench,
  Brain,
  FileText,
  Settings
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  { id: "overview", label: "Genel Bakış", icon: LayoutDashboard },
  { id: "sensors", label: "Canlı Sensör İzleme", icon: Activity },
  { id: "anomaly", label: "Anomali Tespiti", icon: AlertTriangle },
  { id: "maintenance", label: "Öngörülü Bakım", icon: Wrench },
  { id: "xai", label: "Açıklanabilir Yapay Zeka", icon: Brain },
  { id: "reports", label: "Raporlar ve Kararlar", icon: FileText },
  { id: "settings", label: "Ayarlar", icon: Settings },
];

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  return (
    <div className="bg-[#1a2332] border-r border-gray-700 w-64 flex flex-col">
      <div className="p-6">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white p-3 rounded-lg text-center">
          <div className="text-xs uppercase tracking-wider mb-1">Sistem Durumu</div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm">Tüm Sistemler Çalışıyor</span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all ${isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                : "text-gray-300 hover:bg-gray-800"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}