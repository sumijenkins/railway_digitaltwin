import React, { useEffect, useMemo, useState } from "react";
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
import { telemetryService } from "../../services/telemetryService";
import { TelemetryReading } from "../../types/Railway";

const colors = ["#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6"];
const segmentOptions = ["S1", "S2", "S3", "S4", "S5", "S6"];

type XaiPayload = {
  rms: number;
  peakToPeak: number;
  fftEnergy: number;
  slopeGradient: number;
  snr: number;
};

function calculateXaiPayload(readings: TelemetryReading[]): XaiPayload {
  const vibrationValues = readings
    .filter((r) => r.channelName?.toLowerCase().includes("vibration"))
    .map((r) => Number(r.value))
    .filter((v) => !Number.isNaN(v));

  const slopeValues = readings
    .filter(
      (r) =>
        r.channelName?.toLowerCase().includes("slope") ||
        r.channelName?.toLowerCase().includes("tilt")
    )
    .map((r) => Number(r.value))
    .filter((v) => !Number.isNaN(v));

  const temperatureValues = readings
    .filter((r) => r.channelName?.toLowerCase().includes("temperature"))
    .map((r) => Number(r.value))
    .filter((v) => !Number.isNaN(v));

  const baseValues = vibrationValues.length > 0 ? vibrationValues : temperatureValues;

  const rms =
    baseValues.length > 0
      ? Math.sqrt(baseValues.reduce((sum, v) => sum + v * v, 0) / baseValues.length)
      : 0;

  const peakToPeak =
    baseValues.length > 0
      ? Math.max(...baseValues) - Math.min(...baseValues)
      : 0;

  const fftEnergy = baseValues.reduce((sum, v) => sum + v * v, 0);

  const slopeGradient =
    slopeValues.length >= 2
      ? slopeValues[slopeValues.length - 1] - slopeValues[0]
      : 0;

  const mean =
    baseValues.length > 0
      ? baseValues.reduce((sum, v) => sum + v, 0) / baseValues.length
      : 0;

  const variance =
    baseValues.length > 0
      ? baseValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / baseValues.length
      : 0;

  const noise = Math.sqrt(variance);
  const snr = noise > 0 ? Math.min(100, Math.abs(mean / noise) * 10) : 100;

  return {
    rms: Number(rms.toFixed(4)),
    peakToPeak: Number(peakToPeak.toFixed(4)),
    fftEnergy: Number(fftEnergy.toFixed(4)),
    slopeGradient: Number(slopeGradient.toFixed(4)),
    snr: Number(snr.toFixed(4)),
  };
}

export function ExplainableAIPanel() {
  const [selectedTab, setSelectedTab] = useState<"SHAP" | "LIME">("SHAP");
  const [selectedSegment, setSelectedSegment] = useState("S1");
  const [xaiData, setXaiData] = useState<XaiExplanation | null>(null);
  const [payload, setPayload] = useState<XaiPayload | null>(null);
  const [telemetryCount, setTelemetryCount] = useState(0);
  const [latestTimestamp, setLatestTimestamp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadXaiForSegment = async (segmentId: string) => {
    setLoading(true);

    try {
      const readings = await telemetryService.getTelemetryBySegment(segmentId, 120);

      if (!readings || readings.length === 0) {
        setError(`${segmentId} segmenti için telemetri verisi bulunamadı.`);
        setXaiData(null);
        setPayload(null);
        setTelemetryCount(0);
        setLatestTimestamp(null);
        return;
      }

      const calculatedPayload = calculateXaiPayload(readings);
      const explanation = await xaiService.explainFeature(calculatedPayload);

      setPayload(calculatedPayload);
      setXaiData(explanation);
      setTelemetryCount(readings.length);
      setLatestTimestamp(readings[0]?.recordedAt ?? null);
      setError(null);
    } catch {
      setError("XAI explanation could not be loaded.");
      setXaiData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadXaiForSegment(selectedSegment);
  }, [selectedSegment]);

  const methodLabel = useMemo(() => {
    if (!xaiData?.method) return "XAI";
    return xaiData.method === "RuleBasedXAI"
      ? "Rule-based XAI"
      : xaiData.method;
  }, [xaiData]);

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-purple-400" />
              <div>
                <CardTitle className="text-white text-xl">
                  Açıklanabilir Yapay Zeka (XAI)
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Method: {methodLabel} • Segment: {selectedSegment}
                </CardDescription>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <select
                className="bg-gray-900 text-white border border-gray-700 rounded-lg px-3 py-2 text-sm"
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
              >
                {segmentOptions.map((segment) => (
                  <option key={segment} value={segment}>
                    {segment}
                  </option>
                ))}
              </select>

              <Badge variant="outline" className="text-purple-300 border-purple-300">
                LIVE SEGMENT DATA
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <p className="text-gray-500 text-xs uppercase font-bold">Telemetry Count</p>
              <p className="text-white text-lg font-bold">{telemetryCount}</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <p className="text-gray-500 text-xs uppercase font-bold">Latest Reading</p>
              <p className="text-white text-xs">{latestTimestamp ?? "-"}</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
              <p className="text-gray-500 text-xs uppercase font-bold">Payload Source</p>
              <p className="text-green-300 text-sm font-bold">Real telemetry</p>
            </div>
          </div>

          {payload && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                <p className="text-gray-500 text-xs">RMS</p>
                <p className="text-white font-bold">{payload.rms}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                <p className="text-gray-500 text-xs">Peak-to-Peak</p>
                <p className="text-white font-bold">{payload.peakToPeak}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                <p className="text-gray-500 text-xs">FFT Energy</p>
                <p className="text-white font-bold">{payload.fftEnergy}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                <p className="text-gray-500 text-xs">Slope Gradient</p>
                <p className="text-white font-bold">{payload.slopeGradient}</p>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 border border-gray-700">
                <p className="text-gray-500 text-xs">SNR</p>
                <p className="text-white font-bold">{payload.snr}</p>
              </div>
            </div>
          )}

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