"use client";

import { useState } from "react";

// Define types for health metrics
export interface HealthMetric {
  id: string;
  name: string;
  unit: string;
  normalRange: {
    min: number | null;
    max: number | null;
  };
  description: string;
  category: string;
}

export interface MetricReading {
  metricId: string;
  value: number;
  date: string;
  status: "normal" | "low" | "high" | "critical";
}

export interface Report {
  id: string;
  userId: string;
  date: string;
  name: string;
  readings: MetricReading[];
}

// Sample health metrics data
const healthMetrics: HealthMetric[] = [
  {
    id: "glucose",
    name: "Glucose (Fasting)",
    unit: "mg/dL",
    normalRange: { min: 70, max: 99 },
    description: "Measures the amount of glucose in your blood after fasting for at least 8 hours.",
    category: "Blood Sugar"
  },
  {
    id: "total_cholesterol",
    name: "Total Cholesterol",
    unit: "mg/dL",
    normalRange: { min: null, max: 200 },
    description: "Measures all cholesterol in your blood, including HDL, LDL, and triglycerides.",
    category: "Lipids"
  },
  {
    id: "hdl",
    name: "HDL Cholesterol",
    unit: "mg/dL",
    normalRange: { min: 40, max: null },
    description: "High-density lipoprotein, often called 'good' cholesterol.",
    category: "Lipids"
  },
  {
    id: "ldl",
    name: "LDL Cholesterol",
    unit: "mg/dL",
    normalRange: { min: null, max: 100 },
    description: "Low-density lipoprotein, often called 'bad' cholesterol.",
    category: "Lipids"
  },
  {
    id: "triglycerides",
    name: "Triglycerides",
    unit: "mg/dL",
    normalRange: { min: null, max: 150 },
    description: "A type of fat found in your blood that your body uses for energy.",
    category: "Lipids"
  },
  {
    id: "vitamin_d",
    name: "Vitamin D, 25-OH",
    unit: "ng/mL",
    normalRange: { min: 30, max: 50 },
    description: "Measures the amount of vitamin D in your blood, important for bone health.",
    category: "Vitamins"
  },
  {
    id: "tsh",
    name: "TSH",
    unit: "mIU/L",
    normalRange: { min: 0.5, max: 4.5 },
    description: "Thyroid-stimulating hormone, which regulates thyroid function.",
    category: "Hormones"
  },
  {
    id: "creatinine",
    name: "Creatinine",
    unit: "mg/dL",
    normalRange: { min: 0.6, max: 1.2 },
    description: "Waste product filtered by your kidneys, used to measure kidney function.",
    category: "Kidney Function"
  },
  {
    id: "alt",
    name: "ALT",
    unit: "U/L",
    normalRange: { min: 16, max: 61 },
    description: "Enzyme found primarily in the liver, used to detect liver damage.",
    category: "Liver Function"
  },
  {
    id: "ast",
    name: "AST",
    unit: "U/L",
    normalRange: { min: 15, max: 37 },
    description: "Enzyme found in the liver and other tissues, used to detect liver damage.",
    category: "Liver Function"
  }
];

// Sample user reports
const sampleReports: Report[] = [
  {
    id: "report1",
    userId: "user123",
    date: "2025-01-15",
    name: "January Checkup",
    readings: [
      { metricId: "glucose", value: 95, date: "2025-01-15", status: "normal" },
      { metricId: "total_cholesterol", value: 210, date: "2025-01-15", status: "high" },
      { metricId: "hdl", value: 45, date: "2025-01-15", status: "normal" },
      { metricId: "ldl", value: 141, date: "2025-01-15", status: "high" },
      { metricId: "triglycerides", value: 120, date: "2025-01-15", status: "normal" },
      { metricId: "vitamin_d", value: 24, date: "2025-01-15", status: "low" },
      { metricId: "tsh", value: 2.5, date: "2025-01-15", status: "normal" }
    ]
  },
  {
    id: "report2",
    userId: "user123",
    date: "2025-02-20",
    name: "February Follow-up",
    readings: [
      { metricId: "glucose", value: 92, date: "2025-02-20", status: "normal" },
      { metricId: "total_cholesterol", value: 195, date: "2025-02-20", status: "normal" },
      { metricId: "hdl", value: 48, date: "2025-02-20", status: "normal" },
      { metricId: "ldl", value: 130, date: "2025-02-20", status: "high" },
      { metricId: "triglycerides", value: 110, date: "2025-02-20", status: "normal" },
      { metricId: "vitamin_d", value: 28, date: "2025-02-20", status: "low" },
      { metricId: "tsh", value: 2.3, date: "2025-02-20", status: "normal" }
    ]
  },
  {
    id: "report3",
    userId: "user123",
    date: "2025-03-25",
    name: "March Follow-up",
    readings: [
      { metricId: "glucose", value: 88, date: "2025-03-25", status: "normal" },
      { metricId: "total_cholesterol", value: 185, date: "2025-03-25", status: "normal" },
      { metricId: "hdl", value: 52, date: "2025-03-25", status: "normal" },
      { metricId: "ldl", value: 115, date: "2025-03-25", status: "high" },
      { metricId: "triglycerides", value: 95, date: "2025-03-25", status: "normal" },
      { metricId: "vitamin_d", value: 32, date: "2025-03-25", status: "normal" },
      { metricId: "tsh", value: 2.2, date: "2025-03-25", status: "normal" }
    ]
  }
];

// Hook for trends data
export const useTrendsData = () => {
  const [reports, setReports] = useState<Report[]>(sampleReports);
  const [metrics] = useState<HealthMetric[]>(healthMetrics);

  // Get all readings for a specific metric
  const getMetricReadings = (metricId: string) => {
    return reports
      .flatMap(report => 
        report.readings.filter(reading => reading.metricId === metricId)
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  // Get a specific metric by ID
  const getMetricById = (metricId: string) => {
    return metrics.find(metric => metric.id === metricId);
  };

  // Get all metrics by category
  const getMetricsByCategory = () => {
    const categories: { [key: string]: HealthMetric[] } = {};
    
    metrics.forEach(metric => {
      if (!categories[metric.category]) {
        categories[metric.category] = [];
      }
      categories[metric.category].push(metric);
    });
    
    return categories;
  };

  // Get all reports
  const getAllReports = () => {
    return reports.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Add a new report
  const addReport = (report: Report) => {
    setReports(prev => [...prev, report]);
  };

  return {
    metrics,
    reports,
    getMetricReadings,
    getMetricById,
    getMetricsByCategory,
    getAllReports,
    addReport
  };
};
