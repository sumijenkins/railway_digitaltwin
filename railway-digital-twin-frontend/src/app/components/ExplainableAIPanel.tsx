import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AlertCircle, TrendingUp, Brain, Lightbulb } from "lucide-react";
import { xaiService, XaiExplanation } from "../../services/xaiService";

const defaultPayload = {
  rms: 32,
  peakToPeak: 45,
  fftEnergy: 1800,
  slopeGradient: 0.06,
  snr: 50,
};

const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];

export function ExplainableAIPanel() {
  const [selectedTab, setSelectedTab] = useState<"SHAP" | "LIME">("SHAP");
  const [xaiData, setXaiData] = useState<XaiExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    xaiService
      .explainFeature(defaultPayload)
      .then((data) => {
        setXaiData(data);
        setError(null);
      })
      .catch(() => {
        setError("XAI explanation could not be loaded.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 text-gray-300">
        XAI verisi yükleniyor...
      </div>
    );
  }

  if (error || !xaiData) {
    return (
      <div className="bg-red-900/30 rounded-lg border border-red-700 p-6 text-red-200">
        {error || "XAI verisi bulunamadı."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-800 rounded-lg border border-gray-700">
        <CardHeader className="border-b border-gray-700">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-400" />
              <div>
                <CardTitle className="text-white text-xl">
                  Açıklanabilir Yapay Zeka (XAI)
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Method: {xaiData.method}
                </CardDescription>
              </div>
            </div>

            <Badge variant="outline" className="text-purple-300 border-purple-300">
              LIVE API
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              Detaylı Açıklama
            </h3>

            <p className="text-gray-300 text-sm leading-relaxed">
              {xaiData.explanation}
            </p>
          </div>

          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as "SHAP" | "LIME")}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="SHAP" className="data-[state=active]:bg-purple-600">
                Feature Importance
              </TabsTrigger>
              <TabsTrigger value="LIME" className="data-[state=active]:bg-blue-600">
                Local Factors
              </TabsTrigger>
            </TabsList>

            <TabsContent value="SHAP" className="space-y-4 mt-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Özellik Katkı Analizi
                </h3>

                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={xaiData.featureImportance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      type="number"
                      stroke="#9ca3af"
                      tick={{ fill: "#9ca3af" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="feature"
                      stroke="#9ca3af"
                      tick={{ fill: "#9ca3af" }}
                      width={150}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1f2937",
                        border: "1px solid #374151",
                        color: "#fff",
                      }}
                      formatter={(value: any) => `${(value * 100).toFixed(1)}%`}
                    />
                    <Bar dataKey="importance" radius={[0, 8, 8, 0]}>
                      {xaiData.featureImportance.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {xaiData.featureImportance.map((item, idx) => (
                  <div key={idx} className="bg-gray-900 p-3 rounded border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">{item.feature}</p>
                    <span className="text-lg font-bold text-white">
                      {(item.importance * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="LIME" className="space-y-4 mt-4">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                <h3 className="text-sm font-semibold text-white mb-4">
                  Lokal Açıklanabilirlik Faktörleri
                </h3>

                <div className="flex gap-2 flex-wrap">
                  {xaiData.topFactors.map((factor, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className={
                        factor.severity === "HIGH"
                          ? "text-red-300 border-red-300"
                          : factor.severity === "MEDIUM"
                            ? "text-yellow-300 border-yellow-300"
                            : "text-green-300 border-green-300"
                      }
                    >
                      {factor.feature}: {factor.severity}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Anahtar Faktörler
            </h3>

            <ul className="space-y-2">
              {xaiData.keyFactors.map((factor, idx) => (
                <li key={idx} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-cyan-400">•</span>
                  {factor}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 p-4 rounded-lg border border-orange-700/50">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400" />
              Önerilen Eylemler
            </h3>

            <ul className="space-y-2">
              {xaiData.recommendedActions.map((action, idx) => (
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