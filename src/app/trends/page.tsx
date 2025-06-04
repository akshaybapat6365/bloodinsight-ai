"use client";

import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  HealthMetric,
  MetricReading,
  Report,
  fetchHealthMetrics,
  fetchReports,
} from "@/lib/trends-data";
import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function TrendsPage() {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("");
  const [activeTab, setActiveTab] = useState("timeline");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, r] = await Promise.all([fetchHealthMetrics(), fetchReports()]);
        setMetrics(m);
        setReports(r);
        if (m.length > 0) setSelectedMetric(m[0].id);
      } catch (err) {
        console.error("Failed to load trends data", err);
        setLoadError("Failed to load trends data. Please try again later.");
      }
    };
    load();
  }, []);

  const getMetricById = (id: string) => metrics.find(m => m.id === id);
  const getMetricsByCategory = () => {
    const categories: { [key: string]: HealthMetric[] } = {};
    metrics.forEach(metric => {
      if (!categories[metric.category]) categories[metric.category] = [];
      categories[metric.category].push(metric);
    });
    return categories;
  };
  const getMetricReadings = (metricId: string) =>
    reports
      .flatMap(r => r.readings.filter(read => read.metricId === metricId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const metricsByCategory = getMetricsByCategory();
  const allReports = reports;
  const selectedMetricData = getMetricById(selectedMetric);
  const metricReadings = getMetricReadings(selectedMetric);
  
  // Format data for the chart
  const chartData = metricReadings.map(reading => ({
    date: new Date(reading.date).toLocaleDateString(),
    value: reading.value,
    status: reading.status
  }));
  
  // Determine line color based on metric status
  const getLineColor = () => {
    // Check if any readings are abnormal
    const hasAbnormal = metricReadings.some(reading => reading.status !== "normal");
    return hasAbnormal ? "#f97316" : "#3b82f6";
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "normal":
        return "bg-green-500/20 text-green-500";
      case "low":
        return "bg-amber-500/20 text-amber-500";
      case "high":
        return "bg-amber-500/20 text-amber-500";
      case "critical":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-secondary/20 text-secondary-foreground";
    }
  };
  
  // Format status text
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Find file ID for a specific reading
  const getFileIdForReading = (reading: MetricReading) => {
    const report = allReports.find(report =>
      report.readings.some(r =>
        r.metricId === reading.metricId &&
        r.date === reading.date &&
        r.value === reading.value
      )
    );
    return report?.fileId || "";
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col bg-background">
        <header className="sticky top-0 z-10 w-full border-b border-border bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-xl font-bold text-primary">
                BloodInsight AI
              </Link>
            </div>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </nav>
          </div>
        </header>

        <main className="flex-1 container py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">Health Trends</h1>
            <Button asChild>
              <Link href="/upload">Upload New Report</Link>
            </Button>
          </div>

          {loadError && (
            <div className="mb-6 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive text-sm">
              {loadError}
            </div>
          )}

          <Tabs defaultValue="timeline" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-8">
              <TabsTrigger value="timeline">Timeline View</TabsTrigger>
              <TabsTrigger value="reports">Reports History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="timeline" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-1 space-y-6">
                  <div className="p-6 rounded-lg border border-border bg-card">
                    <h3 className="text-lg font-medium mb-4">Health Metrics</h3>
                    
                    <div className="space-y-4">
                      {Object.entries(metricsByCategory).map(([category, categoryMetrics]) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                          <ul className="space-y-1">
                            {categoryMetrics.map(metric => (
                              <li key={metric.id}>
                                <button
                                  onClick={() => setSelectedMetric(metric.id)}
                                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                                    selectedMetric === metric.id
                                      ? "bg-primary/10 text-primary"
                                      : "hover:bg-secondary/20"
                                  }`}
                                >
                                  {metric.name}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-3 space-y-6">
                  <div className="p-6 rounded-lg border border-border bg-card">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-medium">{selectedMetricData?.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Normal Range: {
                            selectedMetricData?.normalRange.min !== null 
                              ? `${selectedMetricData?.normalRange.min} ${selectedMetricData?.unit}` 
                              : ""
                          }
                          {selectedMetricData?.normalRange.min !== null && selectedMetricData?.normalRange.max !== null ? " - " : ""}
                          {
                            selectedMetricData?.normalRange.max !== null 
                              ? `${selectedMetricData?.normalRange.max} ${selectedMetricData?.unit}` 
                              : ""
                          }
                          {selectedMetricData?.normalRange.min === null && selectedMetricData?.normalRange.max !== null ? ` or less` : ""}
                          {selectedMetricData?.normalRange.min !== null && selectedMetricData?.normalRange.max === null ? ` or more` : ""}
                        </p>
                      </div>
                      
                      <div className="mt-2 md:mt-0">
                        <span className="text-sm text-muted-foreground">
                          {metricReadings.length} readings
                        </span>
                      </div>
                    </div>
                    
                    {metricReadings.length > 0 ? (
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={chartData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#9CA3AF"
                              tick={{ fill: '#9CA3AF' }}
                            />
                            <YAxis 
                              stroke="#9CA3AF"
                              tick={{ fill: '#9CA3AF' }}
                              label={{ 
                                value: selectedMetricData?.unit, 
                                angle: -90, 
                                position: 'insideLeft',
                                style: { fill: '#9CA3AF' }
                              }} 
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                borderColor: '#374151',
                                color: '#F9FAFB'
                              }} 
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="value"
                              name={selectedMetricData?.name}
                              stroke={getLineColor()}
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                            {/* Add reference lines for normal range if applicable */}
                            {selectedMetricData?.normalRange.min !== null && (
                              <Line
                                type="monotone"
                                dataKey={() => selectedMetricData?.normalRange.min}
                                stroke="#4B5563"
                                strokeDasharray="5 5"
                                name="Min Normal"
                                dot={false}
                              />
                            )}
                            {selectedMetricData?.normalRange.max !== null && (
                              <Line
                                type="monotone"
                                dataKey={() => selectedMetricData?.normalRange.max}
                                stroke="#4B5563"
                                strokeDasharray="5 5"
                                name="Max Normal"
                                dot={false}
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-80 flex items-center justify-center">
                        <p className="text-muted-foreground">No data available for this metric.</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6 rounded-lg border border-border bg-card">
                    <h3 className="text-lg font-medium mb-4">Reading History</h3>
                    
                    {metricReadings.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Value</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Report</th>
                            </tr>
                          </thead>
                          <tbody>
                            {metricReadings.map((reading, index) => (
                              <tr key={index} className="border-b border-border">
                                <td className="py-3 px-4 text-sm">
                                  {new Date(reading.date).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  {reading.value} {selectedMetricData?.unit}
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(reading.status)}`}>
                                    {formatStatus(reading.status)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm">
                                  <Link href={`/analysis?fileId=${getFileIdForReading(reading)}`} className="text-primary hover:underline">
                                    View Report
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No data available for this metric.</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-6">
              <div className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-lg font-medium mb-4">Reports History</h3>
                
                {allReports.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Report Name</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Metrics</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allReports.map((report, index) => (
                          <tr key={index} className="border-b border-border">
                            <td className="py-3 px-4 text-sm">
                              {new Date(report.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {report.name}
                            </td>
                            <td className="py-3 px-4 text-sm">
                              {report.readings.length} metrics
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <Link href={`/analysis?fileId=${report.fileId}`} className="text-primary hover:underline">
                                View Details
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No reports available.</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  );
}
