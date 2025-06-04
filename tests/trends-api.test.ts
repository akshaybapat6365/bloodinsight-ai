import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

let healthMetricFindMany: any;
let getServerSessionMock: any;
let userFindUniqueMock: any;
let reportFindManyMock: any;

vi.mock('next-auth/next', () => ({
  getServerSession: (...args: any[]) => getServerSessionMock(...args),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    healthMetric: { findMany: (...args: any[]) => healthMetricFindMany(...args) },
    user: { findUnique: (...args: any[]) => userFindUniqueMock(...args) },
    report: { findMany: (...args: any[]) => reportFindManyMock(...args) },
  },
}));

describe('GET /api/trends/metrics', () => {
  beforeEach(() => {
    vi.resetModules();
    healthMetricFindMany = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns formatted metrics', async () => {
    const metrics = [
      {
        id: 'm1',
        name: 'Hemoglobin',
        unit: 'g/dL',
        minValue: 12,
        maxValue: 16,
        description: 'desc',
        category: 'Blood',
      },
    ];
    healthMetricFindMany.mockResolvedValue(metrics);
    const { GET } = await import('../src/app/api/trends/metrics/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([
      {
        id: 'm1',
        name: 'Hemoglobin',
        unit: 'g/dL',
        normalRange: { min: 12, max: 16 },
        description: 'desc',
        category: 'Blood',
      },
    ]);
    expect(healthMetricFindMany).toHaveBeenCalled();
  });
});

describe('GET /api/trends/reports', () => {
  beforeEach(() => {
    vi.resetModules();
    getServerSessionMock = vi.fn();
    userFindUniqueMock = vi.fn();
    reportFindManyMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    getServerSessionMock.mockResolvedValue(null);
    const { GET } = await import('../src/app/api/trends/reports/route');
    const res = await GET();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns reports for authenticated user', async () => {
    getServerSessionMock.mockResolvedValue({ user: { email: 'a@test.com' } });
    userFindUniqueMock.mockResolvedValue({ id: 'u1' });
    const reports = [
      {
        id: 'r1',
        userId: 'u1',
        date: new Date('2024-01-02T00:00:00Z'),
        name: 'Report',
        fileId: 'file1',
        textAnalysis: 'analysis',
        fileUrl: null,
        readings: [
          { metricId: 'm1', value: 1, status: 'normal' },
        ],
      },
    ];
    reportFindManyMock.mockResolvedValue(reports);

    const { GET } = await import('../src/app/api/trends/reports/route');
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual([
      {
        id: 'r1',
        userId: 'u1',
        date: '2024-01-02T00:00:00.000Z',
        name: 'Report',
        fileId: 'file1',
        textAnalysis: 'analysis',
        readings: [
          {
            metricId: 'm1',
            value: 1,
            date: '2024-01-02T00:00:00.000Z',
            status: 'normal',
          },
        ],
      },
    ]);
    expect(reportFindManyMock).toHaveBeenCalledWith({
      where: { userId: 'u1' },
      orderBy: { date: 'desc' },
      include: { readings: true },
    });
  });
});
