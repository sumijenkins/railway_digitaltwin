import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertCircle, FileText, Zap, TrendingDown, Download, Copy } from 'lucide-react';
import { jsPDF } from 'jspdf';

export function GenerativeReportPanel() {
  const [reportType, setReportType] = useState<'EXECUTIVE' | 'DETAILED'>('EXECUTIVE');
  const [copied, setCopied] = useState(false);

  const executiveReport = `
📊 EXEKÜTİF ÖZET - Demir Yolu Dijital İkiz Sistemi
Tarih: 29 Nisan 2026 | Oluşturma Saati: 14:35 UTC

🟢 SISTEM DURUMU: UYARI
Sistem genel sağlığı iyi, ancak Segment S3 üzerinde kritik anomali tespit edilmiştir.

📈 ANA METRİKLER:
• Genel Verimlilik: 87.3% ↓ (1.2 puan düşüş)
• Ortalama Risk Seviyesi: 32.1% ⚠️ (yüksek)
• Bakım Gereken Segment: 3 adet
• Tespit Edilen Anomali: 5 adet (1 kritik)

🚨 ÖN PLANA ALNAN KONULAR:
1. [KRITIK] Segment S3 - Ray Sıcaklığı Anomalisi
   - Anomali Skoru: 89/100
   - Önem: AÇIL
   - Önerilen Eylem: Segment kapatılmalı, bakım başlatılmalı

2. [UYARI] Segment S5 - Titreşim Değerleri Yüksek
   - Anomali Skoru: 65/100
   - Önem: YÜKSEK
   - Önerilen Eylem: Hız limitinin azaltılması

3. [BİLGİ] Segment S1 - Enerji Verimliliği İyileşme
   - Genel Skor: 94/100
   - Durum: Olumlu

✅ ÖNERİLEN EYLEMLER:
□ Segment S3'te acil bakım başlatın (Tahmini Süre: 4-6 saat)
□ Bakım ekibine haberdar edin (Aciliyet: YÜKSEK)
□ Segment S5'te hız sınırını 20% azaltın
□ Segment S1'deki optimize ayarları diğer segmentlere uygulayın

📋 SONRAKİ KONTROL: 30 Nisan 2026 (24 saat sonra)
  `;

  const detailedReport = `
📊 DETAYLI RAPOR - Demir Yolu Dijital İkiz Sistemi
Tarih: 29 Nisan 2026 | Oluşturma Saati: 14:35 UTC

═══════════════════════════════════════════════════════════

🔬 ANOMALİ ANALİZİ:

Toplam Tespit Edilen Anomali: 5
├─ Kritik (Risk > 80): 1
├─ Yüksek (50-80): 2
├─ Orta (30-50): 1
└─ Düşük (< 30): 1

Segment S3 - Ray Sıcaklığı Anomalisi:
  Anomali ID: #42
  Tip: TEMPERATURE_SPIKE
  Ağırlık: CRITICAL (Skor: 89/100)
  Tespit Edilme: 2026-04-29 14:22:15 UTC
  
  Anahtar Faktörler:
  • Ray sıcaklığı: 68.5°C (Normal: 35-45°C)
  • Titreşim X: 2.8 Hz (Normal: 0.5-1.2 Hz)
  • Eğim: +1.8° (Normal: ±0.5°)
  • Tren hızı: 45 km/h ↓ (Sistem tarafından otomatik azaltıldı)
  
  Makine Öğrenimi Modeli Çıkışı:
  - LSTM Autoencoder: Anomali (99.2% güven)
  - Isolation Forest: Anormal (97.8% güven)
  
  XAI Açıklaması (SHAP):
  "Ray sıcaklığı %35 etki ile en önemli faktördür. Bu artış, 
   segment altında olası bir kaplama bozulması gösterebilir."

═══════════════════════════════════════════════════════════

⚡ ENERJİ VE RİSK PROFİLİ:

Segment S1 (İzmir-Manisa):
  Enerji Tüketimi: 185.3 kWh
  Verimlilik Puanı: 94/100
  Risk Seviyesi: 15% (DÜŞÜK)
  Trend: ↑ İyileşiyor

Segment S3 (Akhisar-Soma):
  Enerji Tüketimi: 242.1 kWh
  Verimlilik Puanı: 42/100
  Risk Seviyesi: 76% (YÜKSEK)
  Trend: ↓ Kötüleşiyor

Segment S5 (Balikesir-Susurluk):
  Enerji Tüketimi: 198.7 kWh
  Verimlilik Puanı: 71/100
  Risk Seviyesi: 52% (ORTA)
  Trend: ↓ Düşüşte

═══════════════════════════════════════════════════════════

🛠️ UYGUN BAKIM TAVSIYELERI:

Acil (24 saat içinde):
1. Segment S3 - Ray Yüzey İnceleme
   Tahmini Maliyet: $2,500
   Tahmini Süre: 6 saat (sistem kapanışı gerekli)
   
2. Segment S3 - Çelik Kaynakları Kontrol
   Tahmini Maliyet: $1,200
   Tahmini Süre: 3 saat

Planlı (1 hafta içinde):
3. Segment S5 - Vibrasyon Amortisörleri Bakımı
   Tahmini Maliyet: $800
   Tahmini Süre: 2 saat

4. Tüm Segmentler - Sensör Kalibrasyonu
   Tahmini Maliyet: $450
   Tahmini Süre: 1 saat

═══════════════════════════════════════════════════════════

📊 MLOps VE MODEL PERFORMANSI:

Model Versiyonu: v2.3.1
Son Eğitim: 2026-04-15
Eğitim Verisi: 45 gün (12,480 kayıt)

Model Doğruluk Metrikleri:
• Precision: 96.2%
• Recall: 94.8%
• F1-Score: 95.5%
• ROC-AUC: 0.968

Veri Kalitesi: 98.7% ✓
Eksik Veri Oranı: 0.8%
Aykırı Değer Sayısı: 4 (düzeltildi)

═══════════════════════════════════════════════════════════

📅 SONRAKİ ADIMLAR:
1. Bakım ekibine haberdar et (ÖNCELİK: YÜKSEK)
2. Segment S3'i kapatma planı yap
3. 24 saat sonra re-scanning başlat
4. Model performansını değerlendir
5. Yeni veri ile model güncelleme planla
  `;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportType === 'EXECUTIVE' ? executiveReport : detailedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    const content = reportType === 'EXECUTIVE' ? executiveReport : detailedReport;
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `report-${reportType.toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadCsv = () => {
    const content = reportType === 'EXECUTIVE' ? executiveReport : detailedReport;
    const csvRows = [
      ["reportType", reportType],
      ["generatedAt", new Date().toISOString()],
      ["content", content.replace(/\n/g, '\\n').replace(/"/g, '""')]
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `report-${reportType.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const content = reportType === 'EXECUTIVE' ? executiveReport : detailedReport;
    const lines = doc.splitTextToSize(content, 520);
    doc.setFontSize(10);
    doc.text(lines, 40, 40);
    doc.save(`report-${reportType.toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <Card className="bg-gray-800 border border-gray-700">
      <CardHeader className="border-b border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <CardTitle className="text-white">Generatif AI Rapor</CardTitle>
              <CardDescription className="text-gray-400">
                Doğal dil ile oluşturulan sistem analizi ve önerileri
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-green-300 border-green-300">
            Otomatik Oluşturuldu
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Rapor Tipi Seçimi */}
        <div className="flex gap-2">
          <Button
            variant={reportType === 'EXECUTIVE' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setReportType('EXECUTIVE')}
            className={reportType === 'EXECUTIVE' ? 'bg-blue-600' : ''}
          >
            <Zap className="w-4 h-4 mr-2" />
            Özet
          </Button>
          <Button
            variant={reportType === 'DETAILED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setReportType('DETAILED')}
            className={reportType === 'DETAILED' ? 'bg-blue-600' : ''}
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Detaylı
          </Button>
        </div>

        {/* Rapor İçeriği */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 font-mono text-sm text-gray-200 max-h-96 overflow-y-auto whitespace-pre-wrap break-words">
          {reportType === 'EXECUTIVE' ? executiveReport : detailedReport}
        </div>

        {/* İşlem Butonları */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="border-gray-600 hover:bg-gray-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'Kopyalandı!' : 'Kopyala'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadText}
            className="border-gray-600 hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            TXT
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadCsv}
            className="border-gray-600 hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadPdf}
            className="border-gray-600 hover:bg-gray-700"
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>

        {/* Bilgi Kutusu */}
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-3 flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-200">
            <p className="font-semibold mb-1">💡 Rapor Nedir?</p>
            <p>
              Bu rapor, yapay zeka modelleri tarafından analiz edilen sensör verileri ve işletme koşullarına dayanarak 
              otomatik olarak doğal dille oluşturulmuştur. Her önerinin arkasında SHAP/LIME açıklanabilirlik verileri vardır.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GenerativeReportPanel;
