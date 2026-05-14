package com.railway.digitaltwin.service;

import com.railway.digitaltwin.dto.GeneratedReportDto;
import com.railway.digitaltwin.repository.AnomalyResultRepository;
import com.railway.digitaltwin.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ReportGenerationService {

    private final SensorReadingRepository sensorReadingRepository;
    private final AnomalyResultRepository anomalyResultRepository;

    public GeneratedReportDto generateReport(String type) {

        long telemetryCount = sensorReadingRepository.count();

        long anomalyCount =
                anomalyResultRepository.countByIsAnomalyTrue();

        String content = buildReport(type, telemetryCount, anomalyCount);

        return GeneratedReportDto.builder()
                .reportType(type)
                .generatedAt(LocalDateTime.now().toString())
                .content(content)
                .build();
    }

    private String buildReport(
            String type,
            long telemetryCount,
            long anomalyCount
    ) {

        String severity =
                anomalyCount > 20 ? "KRITIK"
                        : anomalyCount > 5 ? "UYARI"
                        : "NORMAL";

        if ("EXECUTIVE".equalsIgnoreCase(type)) {

            return """
                    📊 ÖZET RAPOR
                                        
                    Sistem Durumu: %s
                    
                    Toplam Telemetry Kaydı: %d
                    Tespit Edilen AI Anomalisi: %d
                    
                    Sistem gerçek zamanlı olarak izlenmektedir.
                    Telemetry akışı aktif durumda çalışmaktadır.
                    
                    ÖNERİLER:
                    • Kritik segmentler gözlemlenmelidir
                    • Sensör sağlık durumu düzenli kontrol edilmelidir
                    • Anomali trendleri analiz edilmelidir
                    """
                    .formatted(
                            severity,
                            telemetryCount,
                            anomalyCount
                    );
        }

        return """
                📊 DETAYLI OPERASYON RAPORU
                
                RAPOR ZAMANI:
                %s
                
                SİSTEM DURUMU:
                %s
                
                TELEMETRY ANALİZİ:
                • Toplam telemetry kaydı: %d
                • MQTT veri akışı aktif
                • Dijital ikiz sistemi çalışıyor
                
                AI ANOMALİ ANALİZİ:
                • Tespit edilen anomaly sayısı: %d
                • Isolation Forest modeli aktif
                • Gerçek zamanlı anomaly monitoring aktif
                
                OPERASYONEL DURUM:
                • Segment bazlı monitoring aktif
                • Enerji ve risk analizi aktif
                • Sensör sağlık sistemi aktif
                
                ÖNERİLEN AKSİYONLAR:
                1. Kritik segmentleri gözlemleyin
                2. Sensör health metriklerini kontrol edin
                3. Vibrasyon trendlerini analiz edin
                4. Risk seviyesi artan segmentlere bakım planlayın
                """
                .formatted(
                        LocalDateTime.now(),
                        severity,
                        telemetryCount,
                        anomalyCount
                );
    }
}