// Shared types for trends data

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
  status: 'normal' | 'low' | 'high' | 'critical';
}

export interface Report {
  id: string;
  userId: string;
  date: string;
  name: string;
  fileId?: string;
  textAnalysis?: string;
  readings: MetricReading[];
}

// Client helpers to retrieve data from the API
export async function fetchHealthMetrics(): Promise<HealthMetric[]> {
  const res = await fetch('/api/trends/metrics');
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export async function fetchReports(): Promise<Report[]> {
  const res = await fetch('/api/trends/reports');
  if (!res.ok) throw new Error('Failed to fetch reports');
  return res.json();
}
