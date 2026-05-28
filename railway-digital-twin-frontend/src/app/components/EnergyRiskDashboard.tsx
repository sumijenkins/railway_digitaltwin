import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { Zap, AlertTriangle, TrendingUp } from 'lucide-react';

const energyData = [
  { segment: 'S1', energy: 185.3, baseline: 180, efficiency: 94 },
  { segment: 'S2', energy: 210.5, baseline: 205, efficiency: 88 },
  { segment: 'S3', energy: 242.1, baseline: 195, efficiency: 42 },
  { segment: 'S4', energy: 198.7, baseline: 200, efficiency: 71 },
  { segment: 'S5', energy: 215.3, baseline: 210, efficiency: 77 },
  { segment: 'S6', energy: 172.4, baseline: 175, efficiency: 91 },
];

const riskData = [
  { segment: 'S1', riskScore: 15, temperature: 12, vibration: 2, slope: 1 },
  { segment: 'S2', riskScore: 28, temperature: 18, vibration: 7, slope: 3 },
  { segment: 'S3', riskScore: 76, temperature: 45, vibration: 22, slope: 9 },
  { segment: 'S4', riskScore: 32, temperature: 20, vibration: 8, slope: 4 },
  { segment: 'S5', riskScore: 52, temperature: 35, vibration: 12, slope: 5 },
  { segment: 'S6', riskScore: 18, temperature: 11, vibration: 4, slope: 3 },
];

const tradeoffData = [
  { segment: 'S1', energy: 185.3, risk: 15, size: 45 },
  { segment: 'S2', energy: 210.5, risk: 28, size: 50 },
  { segment: 'S3', energy: 242.1, risk: 76, size: 89 },
  { segment: 'S4', energy: 198.7, risk: 32, size: 60 },
  { segment: 'S5', energy: 215.3, risk: 52, size: 71 },
  { segment: 'S6', energy: 172.4, risk: 18, size: 40 },
];

const timelineData = [
  { time: '10:00', S1: 14, S2: 26, S3: 72, S4: 30, S5: 48 },
  { time: '11:00', S1: 15, S2: 27, S3: 74, S4: 31, S5: 50 },
  { time: '12:00', S1: 16, S2: 28, S3: 75, S4: 32, S5: 51 },
  { time: '13:00', S1: 15, S2: 29, S3: 76, S4: 33, S5: 52 },
  { time: '14:00', S1: 16, S2: 30, S3: 78, S4: 34, S5: 53 },
  { time: '15:00', S1: 17, S2: 31, S3: 80, S4: 35, S5: 54 },
];

const getRiskColor = (score: number): string => {
  if (score >= 70) return '#ef4444'; // Red
  if (score >= 50) return '#f59e0b'; // Orange
  if (score >= 30) return '#eab308'; // Yellow
  return '#10b981'; // Green
};

const getEfficiencyColor = (score: number): string => {
  if (score >= 85) return '#10b981'; // Green
  if (score >= 70) return '#eab308'; // Yellow
  if (score >= 50) return '#f59e0b'; // Orange
  return '#ef4444'; // Red
};

export function EnergyRiskDashboard({
    energyRiskResults = [],
  }: {
    energyRiskResults?: any[];
  }) {
    console.log("EnergyRiskDashboard energyRiskResults:", energyRiskResults);
    
    const dynamicData = energyRiskResults.map((item) => {
      const energy = Number(
        item.energyScore ??
        item.energyConsumption ??
        item.energy ??
        0
      );
      const rawRisk = Number(
        item.riskScore ??
        item.risk ??
        0
      );
      // 0-1 normalized risk is converted to a 0-100 percentage
      const risk = rawRisk <= 1.0 ? rawRisk * 100.0 : rawRisk;

      const efficiency = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            100
            - ((risk / 100.0) * 60.0)
            - ((energy - 100) * 0.2)
          )
        )
      );

      return {
        segment: item.segmentId,
        segmentName: item.segmentName,
        energy,
        baseline: 200,
        efficiency,
        riskScore: risk,
        risk,
        // Gerçek telemetri alanları — backend'den gelen ham değerler
        temperature: Number(item.temperature ?? 0),
        vibration:   Number(item.vibration   ?? item.tilt ?? 0),
        slope:       Number(item.tilt        ?? 0),
        size: Math.max(40, Math.round(risk)),
        riskLevel: item.riskLevel,
        recommendation: item.recommendation,
      };
    });

    const displayEnergyData =
      dynamicData.length > 0 ? dynamicData : energyData;

    const displayRiskData =
      dynamicData.length > 0 ? dynamicData : riskData;

    const displayTradeoffData =
      dynamicData.length > 0 ? dynamicData : tradeoffData;

    const averageEnergy =
      displayEnergyData.length > 0
        ? (
            displayEnergyData.reduce(
              (sum, item) => sum + Number(item.energy),
              0
            ) / displayEnergyData.length
          ).toFixed(1)
        : "0.0";

    const averageRisk =
      displayRiskData.length > 0
        ? (
            displayRiskData.reduce(
              (sum, item) => sum + Number(item.riskScore),
              0
            ) / displayRiskData.length
          ).toFixed(1)
        : "0.0";

    const averageEfficiency =
      displayEnergyData.length > 0
        ? (
            displayEnergyData.reduce(
              (sum, item) => sum + Number(item.efficiency),
              0
            ) / displayEnergyData.length
          ).toFixed(1)
        : "0.0";

    // Eşik %30.0 (DSS ile uyumlu)
    const warningSegmentCount =
      displayRiskData.filter(
        (item) => Number(item.riskScore) >= 30.0
      ).length;

      const [dynamicTimelineData, setDynamicTimelineData] = useState<any[]>([]);

      useEffect(() => {
        if (displayRiskData.length === 0) return;

      const currentTime = new Date().toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const newPoint = {
        time: currentTime,
        S1: Number(displayRiskData.find((item: any) => item.segment === "S1")?.riskScore ?? 0),
        S2: Number(displayRiskData.find((item: any) => item.segment === "S2")?.riskScore ?? 0),
        S3: Number(displayRiskData.find((item: any) => item.segment === "S3")?.riskScore ?? 0),
        S4: Number(displayRiskData.find((item: any) => item.segment === "S4")?.riskScore ?? 0),
        S5: Number(displayRiskData.find((item: any) => item.segment === "S5")?.riskScore ?? 0),
        S6: Number(displayRiskData.find((item: any) => item.segment === "S6")?.riskScore ?? 0),
      };

      setDynamicTimelineData((prev) => {
        const updated = [...prev, newPoint];
        return updated.slice(-10);
      });
    }, [energyRiskResults]);

    return (
    <div className="space-y-6">
      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Ortalama Enerji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{averageEnergy} kWh</div>
            <p className="text-xs text-blue-200 mt-1">{warningSegmentCount} segment aktif izleniyor</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Ortalama Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{averageRisk}%</div>
            <p className="text-xs text-red-200 mt-1">
              ⚠️ {warningSegmentCount} segment uyarı seviyesi
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Genel Verimlilik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{averageEfficiency}</div>
            <p className="text-xs text-green-200 mt-1">Enerji-risk dengesine göre hesaplandı</p>
          </CardContent>
        </Card>
      </div>

      {/* Ana Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Enerji Verimliliği */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Enerji Verimliliği (Segmentler)</CardTitle>
            <CardDescription className="text-gray-400">
              Mevcut vs Baseline enerji tüketimi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayEnergyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="segment" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="energy" fill="#3b82f6" name="Mevcut (kWh)" />
                <Bar dataKey="baseline" fill="#6b7280" name="Baseline (kWh)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Analizi */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Risk Seviyesi (Segmentler)</CardTitle>
            <CardDescription className="text-gray-400">
              Her segment için bileşik risk skoru
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayRiskData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="segment" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    color: '#fff',
                  }}
                />
                <Bar
                  dataKey="riskScore"
                  fill="#ef4444"
                  name="Risk Skoru"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Enerji-Risk Trade-off Scatter Plot */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Enerji-Risk Trade-off Analizi</CardTitle>
          <CardDescription className="text-gray-400">
            X: Enerji Tüketimi | Y: Risk Seviyesi | Boyut: Anomali Skoru
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" dataKey="energy" name="Enerji (kWh)" stroke="#9ca3af" />
              <YAxis type="number" dataKey="risk" name="Risk (%)" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid #4b5563',
                  borderRadius: '8px',
                  color: '#ffffff',
                }}
                itemStyle={{
                  color: '#ffffff',
                }}
                labelStyle={{
                  color: '#ffffff',
                  fontWeight: 'bold',
                }}
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: any, name: any) => {
                  if (name === 'energy') {
                    return [`${Number(value).toFixed(1)} kWh`, 'Enerji'];
                  }

                  if (name === 'risk') {
                    return [`${Number(value).toFixed(1)} %`, 'Risk'];
                  }

                  return [value, name];
                }}
              />
              <Scatter
                name="Segmentler"
                data={displayTradeoffData}
                fill="#a78bfa"
                fillOpacity={0.6}
                shape="circle"
              />
            </ScatterChart>
          </ResponsiveContainer>

          {/* Segment Açıklamaları */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {displayTradeoffData.map((item) => (
              <div key={item.segment} className="text-xs bg-gray-900 p-2 rounded border border-gray-700">
                <p className="font-semibold text-white">{item.segment}</p>
                <p className="text-gray-400">Enerji: {item.energy.toFixed(1)} kWh</p>
                <p className="text-gray-400">Risk: {item.risk}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Trendi Zaman Serileri */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Risk Seviyesi Zaman Serisi</CardTitle>
          <CardDescription className="text-gray-400">
            Son 10 ölçümde segment bazlı risk değişimi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dynamicTimelineData.length > 0 ? dynamicTimelineData : timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" label={{ value: 'Risk (%)', angle: -90, position: 'insideLeft' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="S1"
                stroke="#10b981"
                name="S1 (Düşük)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="S2"
                stroke="#eab308"
                name="S2 (Orta)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="S3"
                stroke="#ef4444"
                name="S3 (Yüksek)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="S4"
                stroke="#3b82f6"
                name="S4 (Düşük-Orta)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="S5"
                stroke="#f59e0b"
                name="S5 (Orta-Yüksek)"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="S6"
                stroke="#a78bfa"
                name="S6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detaylı Segment Tablosu */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Segment Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-700">
                <tr className="text-gray-400">
                  <th className="text-left py-2">Segment</th>
                  <th className="text-right">Enerji</th>
                  <th className="text-right">Verimlilik</th>
                  <th className="text-right">Risk</th>
                  <th className="text-center">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {displayEnergyData.map((item: any, idx) => {
                  const riskScore = Number(displayRiskData[idx]?.riskScore ?? 0);

                  const riskLevel =
                    item.riskLevel ??
                    (riskScore >= 70 ? "HIGH" : riskScore >= 50 ? "MEDIUM" : "LOW");

                  return (
                    <tr key={item.segment} className="hover:bg-gray-900/50 transition">
                      <td className="py-3 text-white font-semibold">{item.segment}</td>

                      <td className="text-right text-gray-200">
                        {Number(item.energy).toFixed(1)} kWh
                      </td>

                      <td className="text-right">
                        <Badge
                          variant="outline"
                          style={{ borderColor: getEfficiencyColor(Number(item.efficiency)) }}
                        >
                          <span style={{ color: getEfficiencyColor(Number(item.efficiency)) }}>
                            {item.efficiency}%
                          </span>
                        </Badge>
                      </td>

                      <td className="text-right">
                        <Badge
                          variant="outline"
                          style={{ borderColor: getRiskColor(riskScore) }}
                        >
                          <span style={{ color: getRiskColor(riskScore) }}>
                            {riskScore}%
                          </span>
                        </Badge>
                      </td>

                      <td className="text-center">
                        {/* Backend: CRITICAL / WARNING / LOW */}
                        {(riskLevel === "HIGH" || riskLevel === "CRITICAL") && (
                          <Badge variant="destructive" className="text-xs">
                            🚨 ACİL
                          </Badge>
                        )}

                        {(riskLevel === "MEDIUM" || riskLevel === "WARNING") && (
                          <Badge variant="secondary" className="text-xs">
                            ⚠️ UYARI
                          </Badge>
                        )}

                        {riskLevel === "LOW" && (
                          <Badge variant="outline" className="text-xs">
                            ✅ NORMAL
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EnergyRiskDashboard;
