import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Brain, TrendingUp, Info } from "lucide-react";

const featureImportance = [
  { feature: "Hat Sıcaklığı", importance: 0.32, color: "#ef4444" },
  { feature: "Segment Risk Skoru", importance: 0.28, color: "#f59e0b" },
  { feature: "Enerji Tüketimi", importance: 0.22, color: "#10b981" },
  { feature: "Titreşim Seviyeleri", importance: 0.12, color: "#3b82f6" },
  { feature: "Hat Eğimi", importance: 0.06, color: "#8b5cf6" },
];

export function ExplainableAIPanel() {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h3 className="text-white text-xl">Açıklanabilir Yapay Zeka - Karar İçgörüleri</h3>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="text-white mb-4">Özellik Önem Analizi (SHAP tabanlı)</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                type="number"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                type="category"
                dataKey="feature"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                width={150}
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Önem']}
              />
              <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                {featureImportance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="text-white mb-2">Bu rota neden seçildi?</h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Yapay zeka modeli, birden fazla faktörün optimal dengesi temelinde <strong className="text-green-400">Birincil Rota (R1)</strong>'yı seçti. Karar, düşük risk seviyelerini korurken (15%) enerji verimliliğine (öncelik verir (92% skor).
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white">Ana Katkı Faktörleri</h4>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-red-400">Hat Sıcaklığı</span>
                <span className="text-white">%32 etki</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '32%' }}></div>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Mevcut sıcaklık okumaları, önerilen rota segmentlerinde optimal termal koşulları göstermektedir.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-yellow-400">Segment Risk Skoru</span>
                <span className="text-white">%28 etki</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Anomali tespit sistemleri, önerilen rota düğümlerinde minimum risk bildirmektedir.
              </p>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-400">Enerji Tüketimi</span>
                <span className="text-white">%22 etki</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '22%' }}></div>
              </div>
              <p className="text-gray-400 text-xs mt-2">
                Rota topolojisi ve eğim profili, maksimum enerji verimliliğini sağlamaktadır.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
