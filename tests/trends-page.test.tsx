// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Ensure React is available globally for components using the new JSX runtime
// when executed in the test environment.
globalThis.React = React;

let fetchMetricsMock: any;
let fetchReportsMock: any;

vi.mock('@/components/protected-route', () => ({
  default: ({ children }: any) => <>{children}</>,
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock('recharts', () => ({
  LineChart: ({ children }: any) => <div data-testid="chart">{children}</div>,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/lib/trends-data', () => ({
  fetchHealthMetrics: (...args: any[]) => fetchMetricsMock(...args),
  fetchReports: (...args: any[]) => fetchReportsMock(...args),
}));

const { default: TrendsPage } = await import('../src/app/trends/page');

describe('TrendsPage component', () => {
  beforeEach(() => {
    fetchMetricsMock = vi.fn();
    fetchReportsMock = vi.fn();
  });

  it('renders metrics on successful fetch', async () => {
    fetchMetricsMock.mockResolvedValue([
      { id: 'm1', name: 'Metric 1', unit: 'u', normalRange: { min: 0, max: 1 }, description: '', category: 'Cat' },
    ]);
    fetchReportsMock.mockResolvedValue([]);

    render(<TrendsPage />);

    await waitFor(() => expect(fetchMetricsMock).toHaveBeenCalled());
    const items = await screen.findAllByText('Metric 1');
    expect(items.length).toBeGreaterThan(0);
  });

  it('shows error when fetch fails', async () => {
    fetchMetricsMock.mockRejectedValue(new Error('fail'));
    fetchReportsMock.mockRejectedValue(new Error('fail'));

    render(<TrendsPage />);

    expect(await screen.findByText(/Failed to load trends data/i)).toBeInTheDocument();
  });
});
