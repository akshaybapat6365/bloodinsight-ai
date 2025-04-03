"use client";

import { usePdfExport, PdfExportButton } from "@/lib/pdf-export";
import { useCsvExport, CsvExportButton } from "@/lib/csv-export";
import { HealthMetric, MetricReading, Report } from "@/lib/trends-data";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ExportOptionsProps {
  report?: Report;
  metrics: HealthMetric[];
  metricReadings?: { [key: string]: MetricReading[] };
  title: string;
  userName?: string;
}

export const ExportOptions = ({ 
  report, 
  metrics, 
  metricReadings, 
  title, 
  userName 
}: ExportOptionsProps) => {
  const { exportReportToPdf, exportTrendsToPdf, isExporting: isPdfExporting } = usePdfExport();
  const { exportReportToCsv, exportTrendsToCsv, isExporting: isCsvExporting } = useCsvExport();
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handlePdfExport = () => {
    if (report) {
      exportReportToPdf({ report, metrics, title, userName });
    } else if (metricReadings) {
      exportTrendsToPdf({ metrics, title, userName, metricReadings });
    }
    setIsExportMenuOpen(false);
  };

  const handleCsvExport = () => {
    if (report) {
      exportReportToCsv({ report, metrics, fileName: title });
    } else if (metricReadings) {
      exportTrendsToCsv({ metrics, fileName: title, metricReadings });
    }
    setIsExportMenuOpen(false);
  };

  return (
    <div className="relative">
      <Button 
        variant="outline" 
        onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
      >
        Export
      </Button>
      
      {isExportMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-card border border-border z-10">
          <div className="py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/20"
              onClick={handlePdfExport}
              disabled={isPdfExporting}
            >
              {isPdfExporting ? "Exporting..." : "Export as PDF"}
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm hover:bg-secondary/20"
              onClick={handleCsvExport}
              disabled={isCsvExporting}
            >
              {isCsvExporting ? "Exporting..." : "Export as CSV"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
