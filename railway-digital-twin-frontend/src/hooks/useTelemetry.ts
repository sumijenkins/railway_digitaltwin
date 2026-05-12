import { useState, useEffect } from "react";
import { telemetryService } from "../services/telemetryService";
import { RailwayNetwork } from "../types/Railway";

export function useTelemetry(setNetwork: React.Dispatch<React.SetStateAction<RailwayNetwork | null>>) {
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [sensorCount, setSensorCount] = useState<number>(0);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [telemetryLoading, setTelemetryLoading] = useState<boolean>(false);
  const [telemetryError, setTelemetryError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setTelemetryLoading(true);
      setTelemetryError(null);

      try {
        const readings = await telemetryService.getLatestTelemetry(120);
        if (readings && readings.length > 0) {

          // 1. Normalize kayıtları (segment + zaman) bazında grupla
          const bySegment: Record<string, Record<string, number | string>> = {};
          for (const r of readings) {
            if (!bySegment[r.segmentId]) {
              bySegment[r.segmentId] = { segmentId: r.segmentId, timestamp: r.recordedAt };
            }
            bySegment[r.segmentId][r.channelName] = r.value;
          }

          // 2. Her segment → grafik data noktasına dönüştür
          const chartData = Object.values(bySegment)
            .slice(0, 20)
            .reverse()
            .map((seg: any) => ({
              time: new Date(seg.timestamp).toLocaleTimeString('tr-TR', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
              }),
              temperature:  seg['ray_temperature']   ?? 0,
              vibration:    seg['ray_vibration_x']   ?? 0,
              tilt:         seg['rail_slope']         ?? 0,
              trainTemp:    seg['train_temperature']  ?? 0,
              speed:        seg['train_speed']        ?? 0,
              trainVib:     seg['train_vibration_x']  ?? 0,
            }));
          setSensorData(chartData);

          // Unique sensor sayısını DB'den türet
          const uniqueSensorIds = new Set(readings.map(r => r.sensorId));
          setSensorCount(uniqueSensorIds.size);

          // 3. Anomali tespiti — en son gelen segment verisini kullan
          const latestSegments = Object.values(bySegment) as any[];
          const newDetectedAnomalies: any[] = [];

          for (const latest of latestSegments) {
            const time = new Date(latest.timestamp).toLocaleTimeString('tr-TR', {
              hour: '2-digit', minute: '2-digit'
            });

            if (latest['ray_temperature'] > 40) {
              newDetectedAnomalies.push({
                time,
                type: "Kritik Sıcaklık",
                severity: "yüksek",
                location: `Segment ${latest.segmentId}`,
                value: `${Number(latest['ray_temperature']).toFixed(1)}°C`,
                status: "aktif"
              });
            }

            if (latest['train_speed'] > 85) {
              newDetectedAnomalies.push({
                time,
                type: "Aşırı Hız Limit Aşımı",
                severity: "orta",
                location: `Segment ${latest.segmentId}`,
                value: `${Number(latest['train_speed']).toFixed(1)} km/h`,
                status: "aktif"
              });
            }

            if (latest['ray_vibration_x'] > 2.5) {
              newDetectedAnomalies.push({
                time,
                type: "Yüksek Ray Titreşimi",
                severity: "yüksek",
                location: `Segment ${latest.segmentId}`,
                value: `${Number(latest['ray_vibration_x']).toFixed(2)} Hz`,
                status: "aktif"
              });
            }

            if (Math.abs(latest['rail_slope'] ?? 0) > 3) {
              newDetectedAnomalies.push({
                time,
                type: "Hatalı Ray Eğimi",
                severity: "orta",
                location: `Segment ${latest.segmentId}`,
                value: `${Number(latest['rail_slope']).toFixed(1)}°`,
                status: "izleniyor"
              });
            }
          }

          if (newDetectedAnomalies.length > 0) {
            setAnomalies(prev => {
              const filtered = newDetectedAnomalies.filter(newA =>
                !prev.some(oldA => oldA.time === newA.time && oldA.type === newA.type)
              );
              return [...filtered, ...prev].slice(0, 10);
            });
          }

          // 4. Update track health scores dynamically
          setNetwork(prevNetwork => {
            if (!prevNetwork) return null;
            const newTracks = prevNetwork.tracks.map(track => {
              const segmentId = track.id.replace('-R', '');
              const segmentData = bySegment[segmentId];
              if (!segmentData) return track;
              
              let health = 95; 
              
              if (Number(segmentData['ray_temperature']) > 40 || Number(segmentData['ray_vibration_x']) > 2.5) {
                  health = 40;
              } else if (Number(segmentData['train_speed']) > 85 || Math.abs(Number(segmentData['rail_slope']) ?? 0) > 3) {
                  health = 70;
              }

              return { ...track, healthScore: health };
            });
            return { ...prevNetwork, tracks: newTracks };
          });
        }
      } catch (error) {
        setTelemetryError("Gerçek zamanlı telemetri verisi yüklenirken bir hata oluştu. Lütfen sunucu bağlantınızı kontrol edin.");
        console.error(error);
      } finally {
        setTelemetryLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [setNetwork]);

  return { sensorData, sensorCount, anomalies, telemetryLoading, telemetryError };
}
