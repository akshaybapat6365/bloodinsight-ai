"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HealthMetric, MetricReading, Report } from "@/lib/trends-data";

interface ExportCsvProps {
  report?: Report;
  metrics: HealthMetric[];
  fileName: string;
}

export const useCsvExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const getMetricById = (metrics: HealthMetric[], id: string) => {
    return metrics.find(metric => metric.id === id);
  };

  const exportReportToCsv = async ({ report, metrics, fileName }: ExportCsvProps) => {
    if (!report) return;
    
    setIsExporting(true);
    
    try {
      // Create CSV header
      let csvContent = "Metric,Value,Unit,Status,Normal Range\n";
      
      // Add readings
      report.readings.forEach(reading => {
        const metric = getMetricById(metrics, reading.metricId);
        if (!metric) return;
        
        const normalRange = `${metric.normalRange.min !== null ? metric.normalRange.min : ''}${metric.normalRange.min !== null && metric.normalRange.max !== null ? ' - ' : ''}${metric.normalRange.max !== null ? metric.normalRange.max : ''}`;
        
        csvContent += `"${metric.name}",${reading.value},"${metric.unit}","${reading.status}","${normalRange}"\n`;
      });
      
      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportTrendsToCsv = async ({ metrics, fileName, metricReadings }: Omit<ExportCsvProps, 'report'> & { metricReadings: { [key: string]: MetricReading[] } }) => {
    setIsExporting(true);
    
    try {
      // Create CSV header
      let csvContent = "Metric,Date,Value,Unit,Status\n";
      
      // Add readings for each metric
      Object.entries(metricReadings).forEach(([metricId, readings]) => {
        const metric = getMetricById(metrics, metricId);
        if (!metric) return;
        
        readings.forEach(reading => {
          csvContent += `"${metric.name}","${reading.date}",${reading.value},"${metric.unit}","${reading.status}"\n`;
        });
      });
      
      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error exporting trends CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportReportToCsv,
    exportTrendsToCsv,
    isExporting
  };
};

export const CsvExportButton = ({ 
  onClick, 
  isExporting,
  variant = "outline",
  size = "default"
}: { 
  onClick: () => void; 
  isExporting: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={isExporting}
    >
      {isExporting ? "Exporting..." : "Export CSV"}
    </Button>
  );
};
