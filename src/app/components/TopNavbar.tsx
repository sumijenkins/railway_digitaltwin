//topnavbar
import { Bell, User, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export function TopNavbar() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-[#1a2332] border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl mb-1">Dijital İkiz Demiryolu İzleme Sistemi</h1>
          <p className="text-gray-400 text-sm">Gerçek Zamanlı Altyapı İstihbaratı ve İzleme</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="flex items-center gap-2 text-gray-300 text-sm">
              <Clock className="w-4 h-4" />
              <span>{formatDate(currentTime)}</span>
            </div>
            <div className="text-green-400 font-mono">{formatTime(currentTime)}</div>
          </div>

          <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors relative">
            <Bell className="w-5 h-5 text-gray-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-lg">
            <User className="w-5 h-5 text-gray-300" />
            <div>
              <div className="text-white text-sm">Dr. Mühendis</div>
              <div className="text-gray-400 text-xs">Sistem Operatörü</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}