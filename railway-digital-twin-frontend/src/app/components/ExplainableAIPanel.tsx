import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { AlertCircle, Brain, Lightbulb, Activity, CheckCircle, Network } from 'lucide-react';

const shapDataAnomaly = [
  { feature: "Ray Sıcaklığı (Max)", importance: 0.38, color: "#ef4444" },
  { feature: "Titreşim Z Ekseni", importance: 0.25, color: "#f97316" },
  { feature: "Hat Eğimi Sapması", importance: 0.18, color: "#eab308" },
  { feature: "Araç Hızı", importance: 0.12, color: "#3b82f6" },
  { feature: "Tonaj Yükü", importance: 0.07, color: "#8b5cf6" },
];

const limeDataAnomaly = [
  { feature: "Ray Sıcaklığı = 48°C", value: 0.42, type: "positive" },
  { feature: "Titreşim Z = 3.2g", value: 0.28, type: "positive" },
  { feature: "Hız = 82 km/h", value: 0.15, type: "positive" },
  { feature: "Son Bakım = 15 Gün", value: -0.12, type: "negative" },
  { feature: "Eğim = %1.2", value: -0.08, type: "negative" },
];

const shapDataRoute = [
  { feature: "Tahmini Enerji Tüketimi", importance: 0.45, color: "#10b981" },
  { feature: "Segment Risk Skoru", importance: 0.30, color: "#ef4444" },
  { feature: "Toplam Süre", importance: 0.15, color: "#3b82f6" },
  { feature: "Hat Trafik Yoğunluğu", importance: 0.10, color: "#8b5cf6" },
];

const limeDataRoute = [
  { feature: "Enerji (S2-S4) < 1.2MWh", value: 0.35, type: "positive" },
  { feature: "S5 Kritik Risk İhlali Yok", value: 0.25, type: "positive" },
  { feature: "Bekleme Süresi = 0", value: 0.20, type: "positive" },
  { feature: "Güzergah Uzunluğu = +12km", value: -0.18, type: "negative" },
];

export function ExplainableAIPanel() {
  const [analysisType, setAnalysisType] = useState<'anomaly' | 'route'>('anomaly');
  const [selectedTab, setSelectedTab] = useState<'SHAP' | 'LIME'>('SHAP');

  const isAnomaly = analysisType === 'anomaly';
  const shapData = isAnomaly ? shapDataAnomaly : shapDataRoute;
  const limeData = isAnomaly ? limeDataAnomaly : limeDataRoute;

  return (
    <div className="space-y-6">
      {/* Analiz Seçici */}
      <div className="flex gap-4">
        <button 
          onClick={() => setAnalysisType('anomaly')}
          className={`flex-1 p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${isAnomaly ? 'bg-purple-900/40 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'bg-gray-800 border-gray-700 opacity-60 hover:opacity-100'}`}
        >
          <div className={`p-3 rounded-lg ${isAnomaly ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-700 text-gray-400'}`}>
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold">Anomali Tespiti XAI</h3>
            <p className="text-gray-400 text-xs">Modelin Segment S5 Kararı</p>
          </div>
        </button>

        <button 
          onClick={() => setAnalysisType('route')}
          className={`flex-1 p-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${!isAnomaly ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-gray-800 border-gray-700 opacity-60 hover:opacity-100'}`}
        >
          <div className={`p-3 rounded-lg ${!isAnomaly ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
            <Network className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold">Rota Optimizasyonu XAI</h3>
            <p className="text-gray-400 text-xs">T-01 için Alternatif 2 Seçimi</p>
          </div>
        </button>
      </div>

      <Card className="bg-[#151b23] rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden">
        <CardHeader className="bg-gray-800/30 border-b border-gray-700/50 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-xl flex items-center gap-2">
                  Model Karar Çıkarımı
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 border">Güven:%94.2</Badge>
                </CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  {isAnomaly ? 'LSTM Autoencoder & Isolation Forest Modeli' : 'Multi-Criteria Dijkstra Optimizasyon Modeli'}
                </CardDescription>
              </div>
            </div>
            <Badge className={`${isAnomaly ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'} border-0 px-3 py-1`}>
              {isAnomaly ? 'KRİTİK TESPİT' : 'OPTİMUM SEÇİM'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Doğal Dil Açıklama (Generative AI) */}
          <div className="relative overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700 shadow-inner">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-500"></div>
            <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Generatif AI Açıklaması
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {isAnomaly 
                ? "Yapay zeka modelimiz, Segment S5'te Kritik seviyede bir anomali tespit etmiştir. Bu kararın temel nedeni, Ray Sıcaklığının mevsimsel normallerin (48°C) üzerine çıkması ve buna eşlik eden Z eksenindeki anormal (3.2g) titreşimlerdir. Eğim ve hız limitleri normal sınırlarda olmasına rağmen, termal genleşme ve titreşim kombinasyonu model tarafından %94.2 güvenle yapısal risk olarak işaretlenmiştir."
                : "Optimizasyon motoru, T-01 yük treni için 'Alternatif Rota 2'yi seçmiştir. Model, S5 segmentindeki tespit edilen yüksek riskli yapısal anomaliyi pas geçmek için rotayı 12km uzatmayı kabul etmiştir. Uzayan rotaya rağmen, düşük eğimli S2-S4 varyantının kullanılması enerji tüketimini 1.2MWh altında tutarak optimum maliyet-güvenlik dengesini sağlamıştır."
              }
            </p>
          </div>

          {/* SHAP vs LIME Tabs */}
          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'SHAP' | 'LIME')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900/50 p-1 border border-gray-700/50 rounded-xl">
              <TabsTrigger value="SHAP" className="rounded-lg data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-300 py-2.5">
                <div className="flex items-center gap-2 font-semibold">
                  <Activity className="w-4 h-4" /> SHAP (Global Feature Importance)
                </div>
              </TabsTrigger>
              <TabsTrigger value="LIME" className="rounded-lg data-[state=active]:bg-cyan-600 data-[state=active]:text-white transition-all duration-300 py-2.5">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle className="w-4 h-4" /> LIME (Local Explainability)
                </div>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="SHAP" className="m-0 animate-in fade-in duration-500">
                <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-gray-300 font-medium mb-6 text-sm text-center">Modelin genel olarak karar alırken hangi sensör verilerine ne kadar ağırlık verdiğini gösterir.</h3>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#6b7280" tickFormatter={(v) => `${(v*100).toFixed(0)}%`} />
                        <YAxis type="category" dataKey="feature" stroke="#9ca3af" width={160} tick={{ fontSize: 12 }} />
                        <Tooltip
                          cursor={{ fill: '#374151', opacity: 0.4 }}
                          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                          formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Katkı Payı']}
                        />
                        <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={24}>
                          {shapData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="LIME" className="m-0 animate-in fade-in duration-500">
                <div className="bg-gray-800/40 p-6 rounded-xl border border-gray-700/50">
                  <h3 className="text-gray-300 font-medium mb-6 text-sm text-center">Şu anki spesifik tahminde (lokal) hangi parametrelerin sonucu ne yönde (pozitif/negatif) ittiğini gösterir.</h3>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={limeData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#6b7280" domain={[-0.3, 0.5]} tickFormatter={(v) => v > 0 ? `+${v}` : v} />
                        <YAxis type="category" dataKey="feature" stroke="#9ca3af" width={180} tick={{ fontSize: 12 }} />
                        <Tooltip
                          cursor={{ fill: '#374151', opacity: 0.4 }}
                          contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                          formatter={(value: any) => [value, 'Etki (Weight)']}
                        />
                        <ReferenceLine x={0} stroke="#9ca3af" />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                          {limeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.type === 'positive' ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Kararı Destekleyen
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div> Karara Karşı Çıkan
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
