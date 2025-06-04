import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let getServerSessionMock: any;
let findUniqueMock: any;
let geminiServiceMock: any;

vi.mock('next-auth/next', () => ({
  getServerSession: (...args: any[]) => getServerSessionMock(...args)
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: any[]) => findUniqueMock(...args),
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([])
    },
    session: {
      count: vi.fn().mockResolvedValue(0)
    },
    report: {
      count: vi.fn().mockResolvedValue(0)
    },
    apiUsage: {
      aggregate: vi.fn().mockResolvedValue({ _count: 0, _avg: { duration: 0 } }),
      findMany: vi.fn().mockResolvedValue([{ createdAt: new Date(), userId: null, endpoint: '/test', status: 'success', duration: 0 }]),
      create: vi.fn()
    }
  },
  default: {
    user: {
      findUnique: (...args: any[]) => findUniqueMock(...args),
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([])
    },
    session: { count: vi.fn().mockResolvedValue(0) },
    report: { count: vi.fn().mockResolvedValue(0) },
    apiUsage: {
      aggregate: vi.fn().mockResolvedValue({ _count: 0, _avg: { duration: 0 } }),
      findMany: vi.fn().mockResolvedValue([{ createdAt: new Date(), userId: null, endpoint: '/test', status: 'success', duration: 0 }]),
      create: vi.fn()
    }
  }
}));

vi.mock('@/lib/gemini-service', () => ({
  getGeminiService: () => geminiServiceMock
}));

describe('admin gemini route auth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getServerSessionMock = vi.fn();
    findUniqueMock = vi.fn();
    geminiServiceMock = { getSystemPrompt: vi.fn().mockReturnValue('prompt') };
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GEMINI_API_KEY;
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
    const { GET } = await import('../src/app/api/admin/gemini/route');
    const res = await GET(new Request('http://test') as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.systemPrompt).toBe('prompt');
    expect(geminiServiceMock.getSystemPrompt).toHaveBeenCalled();
  });
});
