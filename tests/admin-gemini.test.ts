import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let getServerSessionMock: any;
let findUniqueMock: any;
let prismaCountMock: any;
let sessionCountMock: any;
let reportCountMock: any;
let apiAggregateMock: any;
let apiFindManyMock: any;
let userFindManyMock: any;
let geminiServiceMock: any;

vi.mock('next-auth/next', () => ({
  getServerSession: (...args: any[]) => getServerSessionMock(...args)
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => findUniqueMock(...args),
      count: (...args: any[]) => prismaCountMock(...args),
      findMany: (...args: any[]) => userFindManyMock(...args),
    },
    session: { count: (...args: any[]) => sessionCountMock(...args) },
    report: { count: (...args: any[]) => reportCountMock(...args) },
    apiUsage: {
      aggregate: (...args: any[]) => apiAggregateMock(...args),
      findMany: (...args: any[]) => apiFindManyMock(...args),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/gemini-service', () => ({
  getGeminiService: () => geminiServiceMock
}));

describe('admin gemini route auth', () => {
  beforeEach(() => {
    vi.resetModules();
    getServerSessionMock = vi.fn();
    findUniqueMock = vi.fn();
    prismaCountMock = vi.fn();
    sessionCountMock = vi.fn();
    reportCountMock = vi.fn();
    apiAggregateMock = vi.fn();
    apiFindManyMock = vi.fn();
    userFindManyMock = vi.fn();
    geminiServiceMock = { getSystemPrompt: vi.fn().mockReturnValue('prompt') };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 401 if not authenticated', async () => {
    getServerSessionMock.mockResolvedValue(null);
    const { GET } = await import('../src/app/api/admin/gemini/route');
    const res = await GET(new Request('http://test') as any);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: 'Unauthorized' });
  });

  it('returns 403 if user not admin', async () => {
    getServerSessionMock.mockResolvedValue({ user: { email: 'a@test.com' } });
    findUniqueMock.mockResolvedValue({ isAdmin: false });
    const { GET } = await import('../src/app/api/admin/gemini/route');
    const res = await GET(new Request('http://test') as any);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'Forbidden' });
  });

  it('allows access when admin', async () => {
    getServerSessionMock.mockResolvedValue({ user: { email: 'a@test.com' } });
    findUniqueMock.mockResolvedValue({ isAdmin: true });
    prismaCountMock.mockResolvedValue(0);
    sessionCountMock.mockResolvedValue(0);
    reportCountMock.mockResolvedValue(0);
    apiAggregateMock.mockResolvedValue({ _count: 0, _avg: { duration: 0 } });
    apiFindManyMock.mockResolvedValue([]);
    userFindManyMock.mockResolvedValue([]);
    const { GET } = await import('../src/app/api/admin/gemini/route');
    const res = await GET(new Request('http://test') as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toMatchObject({ systemPrompt: 'prompt' });
    expect(geminiServiceMock.getSystemPrompt).toHaveBeenCalled();
  });
});
