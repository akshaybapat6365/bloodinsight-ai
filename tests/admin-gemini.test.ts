import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let getServerSessionMock: any;
let findUniqueMock: any;
let geminiServiceMock: any;

vi.mock('next-auth/next', () => ({
  getServerSession: (...args: any[]) => getServerSessionMock(...args)
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: (...args: any[]) => findUniqueMock(...args) }
  }
}));

vi.mock('@/lib/gemini-service', () => ({
  getGeminiService: () => geminiServiceMock
}));

describe('admin gemini route auth', () => {
  beforeEach(() => {
    vi.resetModules();
    getServerSessionMock = vi.fn();
    findUniqueMock = vi.fn();
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
    const { GET } = await import('../src/app/api/admin/gemini/route');
    const res = await GET(new Request('http://test') as any);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ systemPrompt: 'prompt' });
    expect(geminiServiceMock.getSystemPrompt).toHaveBeenCalled();
  });
});
