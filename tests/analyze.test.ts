import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let retrieveFileMock: any;
let sendMessageMock: any;
let getServerSessionMock: any;
let findUniqueMock: any;
let geminiConfigMock: any;
let apiUsageCreateMock: any;
let getGeminiServiceMock: any;
let reportFindFirstMock: any;
let reportCreateMock: any;
let reportUpdateMock: any;

vi.mock('@google/generative-ai/server', () => ({
  GoogleAIFileManager: vi.fn().mockImplementation(() => ({
    retrieveFile: (...args: any[]) => retrieveFileMock(...args)
  }))
}));

vi.mock('next-auth/next', () => ({
  getServerSession: (...args: any[]) => getServerSessionMock(...args)
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: (...args: any[]) => findUniqueMock(...args) },
    geminiConfig: { findFirst: (...args: any[]) => geminiConfigMock(...args) },
    apiUsage: { create: (...args: any[]) => apiUsageCreateMock(...args) },
    report: {
      findFirst: (...args: any[]) => reportFindFirstMock(...args),
      create: (...args: any[]) => reportCreateMock(...args),
      update: (...args: any[]) => reportUpdateMock(...args),
    },
  }
}));

vi.mock('@/lib/gemini-service', () => ({
  getGeminiService: () => getGeminiServiceMock,
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      startChat: vi.fn().mockReturnValue({
        sendMessage: (...args: any[]) => sendMessageMock(...args)
      })
    })
  }))
}));

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.resetModules();
    retrieveFileMock = vi.fn();
    sendMessageMock = vi.fn();
    getServerSessionMock = vi.fn().mockResolvedValue(null);
    findUniqueMock = vi.fn();
    geminiConfigMock = vi.fn();
    apiUsageCreateMock = vi.fn();
    getGeminiServiceMock = { getSystemPrompt: vi.fn().mockReturnValue('prompt') };
    reportFindFirstMock = vi.fn();
    reportCreateMock = vi.fn();
    reportUpdateMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns analysis on success', async () => {
    process.env.GEMINI_API_KEY = 'key';
    findUniqueMock.mockResolvedValue(null);
    geminiConfigMock.mockResolvedValue(null);
    apiUsageCreateMock.mockResolvedValue({});
    retrieveFileMock.mockResolvedValue({ data: Buffer.from('123'), mimeType: 'text/plain' });
    sendMessageMock.mockResolvedValue({ response: { text: () => 'analysis data' } });

    const { POST } = await import('../src/app/api/analyze/route');

    const req = new Request('http://test', {
      method: 'POST',
      body: JSON.stringify({ fileId: 'file123' })
    });

    const res = await POST(req as any);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.analysis).toBe('analysis data');
    expect(reportCreateMock).not.toHaveBeenCalled();
    expect(reportUpdateMock).not.toHaveBeenCalled();
  });

  it('returns 400 when fileId missing', async () => {
    process.env.GEMINI_API_KEY = 'key';
    geminiConfigMock.mockResolvedValue(null);
    apiUsageCreateMock.mockResolvedValue({});
    const { POST } = await import('../src/app/api/analyze/route');
    const res = await POST(new Request('http://test', { method: 'POST', body: JSON.stringify({}) }) as any);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, error: 'No fileId provided' });
  });

  it('returns 500 when API key missing', async () => {
    delete process.env.GEMINI_API_KEY;
    geminiConfigMock.mockResolvedValue(null);
    apiUsageCreateMock.mockResolvedValue({});
    const { POST } = await import('../src/app/api/analyze/route');
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ fileId: 'x' }) });
    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('stores analysis when user found', async () => {
    process.env.GEMINI_API_KEY = 'key';
    getServerSessionMock.mockResolvedValue({ user: { email: 'a@test.com' } });
    findUniqueMock.mockResolvedValue({ id: 'u1' });
    geminiConfigMock.mockResolvedValue(null);
    apiUsageCreateMock.mockResolvedValue({});
    retrieveFileMock.mockResolvedValue({ data: Buffer.from('1'), mimeType: 'text/plain' });
    sendMessageMock.mockResolvedValue({ response: { text: () => 'analysis' } });
    reportFindFirstMock.mockResolvedValue(null);
    reportCreateMock.mockResolvedValue({});

    const { POST } = await import('../src/app/api/analyze/route');
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ fileId: 'abc' }) });
    const res = await POST(req as any);
    expect(res.status).toBe(200);
    expect(reportCreateMock).toHaveBeenCalled();
  });
});
