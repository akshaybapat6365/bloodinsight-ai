"use client";

import { jsPDF } from "jspdf";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HealthMetric, MetricReading, Report } from "@/lib/trends-data";

interface ExportPdfProps {
  report?: Report;
  metrics: HealthMetric[];
  title: string;
  userName?: string;
}

export const usePdfExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const getMetricById = (metrics: HealthMetric[], id: string) => {
    return metrics.find(metric => metric.id === id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "#22c55e"; // green
      case "low":
      case "high":
        return "#f59e0b"; // amber
      case "critical":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const exportReportToPdf = async ({ report, metrics, title, userName }: ExportPdfProps) => {
    if (!report) return;
    
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, 20, { align: "center" });
      
      // Add date and user info
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Date: ${new Date(report.date).toLocaleDateString()}`, margin, 30);
      if (userName) {
        doc.text(`User: ${userName}`, margin, 38);
      }
      
      // Add report name
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(report.name, margin, 50);
      
      // Add disclaimer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("For educational purposes only. Not intended to replace medical advice.", margin, 58);
      
      // Add readings table header
      let yPos = 70;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text("Metric", margin, yPos);
      doc.text("Value", margin + 80, yPos);
      doc.text("Status", margin + 120, yPos);
      
      // Add line
      yPos += 2;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
      
      // Add readings
      doc.setFontSize(11);
      report.readings.forEach(reading => {
        const metric = getMetricById(metrics, reading.metricId);
        if (!metric) return;
        
        doc.setTextColor(0, 0, 0);
        doc.text(metric.name, margin, yPos);
        doc.text(`${reading.value} ${metric.unit}`, margin + 80, yPos);
        
        const statusColor = getStatusColor(reading.status);
        doc.setTextColor(parseInt(statusColor.slice(1, 3), 16), parseInt(statusColor.slice(3, 5), 16), parseInt(statusColor.slice(5, 7), 16));
        doc.text(reading.status.charAt(0).toUpperCase() + reading.status.slice(1), margin + 120, yPos);
        
        yPos += 10;
        
        // Add new page if needed
        if (yPos > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = 20;
        }
      });
      
      // Add footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`BloodInsight AI - Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
      }
      
      // Save the PDF
      doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportTrendsToPdf = async ({ metrics, title, userName }: Omit<ExportPdfProps, 'report'> & { metricReadings: { [key: string]: MetricReading[] } }) => {
    setIsExporting(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      
      // Add title
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, 20, { align: "center" });
      
      // Add date and user info
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, 30);
      if (userName) {
        doc.text(`User: ${userName}`, margin, 38);
      }
      
      // Add disclaimer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("For educational purposes only. Not intended to replace medical advice.", margin, 46);
      
      // Save the PDF
      doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("Error exporting trends PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportReportToPdf,
    exportTrendsToPdf,
    isExporting
  };
};

export const PdfExportButton = ({ 
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
      {isExporting ? "Exporting..." : "Export PDF"}
    </Button>
  );
};
