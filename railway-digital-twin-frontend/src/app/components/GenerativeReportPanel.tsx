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

  const [generatedReport, setGeneratedReport] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        `http://localhost:8080/api/reports/generate?type=${reportType}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Report generation failed");
      }

      const data = await response.json();

      setGeneratedReport(data.content);

    } catch (error) {

      console.error(error);
      setGeneratedReport("Rapor oluşturulamadı.");

    } finally {

      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedReport || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    const content = generatedReport || "Rapor oluşturulmadı.";
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `report-${reportType.toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadCsv = () => {
    const content = generatedReport || "Rapor oluşturulmadı.";

    const csvRows = [
      ["reportType", reportType],
      ["generatedAt", new Date().toLocaleString("tr-TR")],
      ["content", content],
    ];

    const csvContent =
      "\uFEFF" +
      csvRows
        .map((row) =>
          row
            .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
            .join(",")
        )
        .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `report-${reportType.toLowerCase()}-${new Date()
      .toISOString()
      .split("T")[0]}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const content = generatedReport || "Rapor oluşturulmadı.";

    const safeContent = content
      .replace(/[📊🚨✅⚡🔬🛠️📈📋💡]/g, "")
      .replace(/İ/g, "I")
      .replace(/ı/g, "i")
      .replace(/Ş/g, "S")
      .replace(/ş/g, "s")
      .replace(/Ğ/g, "G")
      .replace(/ğ/g, "g")
      .replace(/Ü/g, "U")
      .replace(/ü/g, "u")
      .replace(/Ö/g, "O")
      .replace(/ö/g, "o")
      .replace(/Ç/g, "C")
      .replace(/ç/g, "c");
    const lines = doc.splitTextToSize(safeContent, 520);
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

          <Button
          onClick={handleGenerateReport}
          className="bg-green-600 hover:bg-green-700"
        >
          Rapor Oluştur
        </Button>
        </div>

        {/* Rapor İçeriği */}
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 font-mono text-sm text-gray-200 max-h-96 overflow-y-auto whitespace-pre-wrap break-words">
          {loading
            ? "Rapor oluşturuluyor..."
            : generatedReport || "Rapor oluşturmak için butona basın."}
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
            <p className="font-semibold mb-1">Rapor Nedir?</p>
            <p>
              Bu rapor, yapay zeka modelleri tarafından analiz edilen sensör verileri ve işletme koşullarına dayanarak 
              otomatik olarak doğal dille oluşturulmuştur.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default GenerativeReportPanel;
