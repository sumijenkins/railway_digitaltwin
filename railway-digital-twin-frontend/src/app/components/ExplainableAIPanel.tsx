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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, TrendingUp, Brain, Lightbulb } from 'lucide-react';

const featureImportance = [
  { feature: "Hat Sıcaklığı", importance: 0.32, color: "#ef4444" },
  { feature: "Segment Risk Skoru", importance: 0.28, color: "#f59e0b" },
  { feature: "Enerji Tüketimi", importance: 0.22, color: "#10b981" },
  { feature: "Titreşim Seviyeleri", importance: 0.12, color: "#3b82f6" },
  { feature: "Hat Eğimi", importance: 0.06, color: "#8b5cf6" },
];

export function ExplainableAIPanel() {
  const [selectedTab, setSelectedTab] = useState<'SHAP' | 'LIME'>('SHAP');

  const mockKeyFactors = [
    '🌡️ Ray sıcaklığı kritik eşikten 45°C üzeri',
    '📈 Titreşim değerleri standart sapmanın 2.5 katı',
    '📊 Segment eğimindeki sapma (+1.2°)',
    '⚡ Tren hızının ani yavaşlaması'
  ];

  const mockActions = [
    '🔧 Segment yüzey kontrolü yapın',
    '⚠️ Hız limitini %15 azaltın',
    '📞 Bakım ekibini haberdar edin',
    '📊 Devam eden izleme gerçekleştirin'
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800 rounded-lg border border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-400" />
              <div>
                <CardTitle className="text-white text-xl">Açıklanabilir Yapay Zeka (XAI)</CardTitle>
                <CardDescription className="text-gray-400">
                  Anomali #42 - TEMPERATURE_SPIKE (Segment S3)
                </CardDescription>
              </div>
            </div>
            <Badge variant="destructive" className="text-sm">
              CRITICAL
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          {/* Doğal Dil Açıklama */}
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              Detaylı Açıklama
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              Bu anomali, segment S3 üzerinde sıcaklık ve titreşim ölçümlerindeki anormal artış nedeniyle tespit edilmiştir. 
              Sıcaklık, tahmin edilen değerden %35 daha yüksektir ve bu durum ray bozulması riskini artırmaktadır. 
              Sistem, acil müdahale gerektiren kritik bir durumu sinyallemektedir.
            </p>
          </div>

          {/* SHAP vs LIME Tabs */}
          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'SHAP' | 'LIME')}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="SHAP" className="data-[state=active]:bg-purple-600">SHAP Analizi</TabsTrigger>
              <TabsTrigger value="LIME" className="data-[state=active]:bg-blue-600">LIME Analizi</TabsTrigger>
            </TabsList>

            <TabsContent value="SHAP" className="space-y-4 mt-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm font-semibold text-white mb-4">Özellik Önemi Analizi</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={featureImportance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                    <YAxis type="category" dataKey="feature" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} width={150} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        color: '#fff'
                      }}
                      formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
                    />
                    <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                      {featureImportance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {featureImportance.map((item, idx) => (
                  <div key={idx} className="bg-gray-900 p-3 rounded border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">{item.feature}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-white">
                        {(item.importance * 100).toFixed(0)}%
                      </span>
                      <div className="w-16 h-2 bg-gray-700 rounded" style={{
                        background: `linear-gradient(90deg, ${item.color}40, ${item.color})`
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="LIME" className="space-y-4 mt-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm font-semibold text-white mb-4">Lokal Açıklanabilirlik Analizi</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Model Tahmini Doğruluğu</span>
                    <span className="text-sm font-semibold text-green-400">94.2%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <p className="text-sm font-semibold text-white mb-3">Tahmin Etiketleri</p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline" className="text-red-300 border-red-300">Anomali: Sıcaklık</Badge>
                      <Badge variant="outline" className="text-yellow-300 border-yellow-300">Risk: Yüksek</Badge>
                      <Badge variant="outline" className="text-orange-300 border-orange-300">Eylem: Acil</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Anahtar Faktörler */}
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Anahtar Faktörler
            </h3>
            <ul className="space-y-2">
              {mockKeyFactors.map((factor, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-cyan-400">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          {/* Önerilen Eylemler */}
          <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 p-4 rounded-lg border border-orange-700/50">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Önerilen Eylemler
            </h3>
            <ul className="space-y-2">
              {mockActions.map((action, idx) => (
                <li key={idx} className="text-sm text-gray-200">
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
