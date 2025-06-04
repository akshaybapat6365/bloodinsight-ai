import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let retrieveFileMock: any;
let sendMessageMock: any;
let prismaMock: any;

vi.mock('@google/generative-ai/server', () => ({
  GoogleAIFileManager: vi.fn().mockImplementation(() => ({
    retrieveFile: (...args: any[]) => retrieveFileMock(...args)
  }))
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

vi.mock('@/lib/prisma', () => ({
  prisma: {
    geminiConfig: { findFirst: vi.fn().mockResolvedValue(null) },
    apiUsage: { create: vi.fn() }
  },
  default: {
    geminiConfig: { findFirst: vi.fn().mockResolvedValue(null) },
    apiUsage: { create: vi.fn() }
  }
}));

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    retrieveFileMock = vi.fn();
    sendMessageMock = vi.fn();
    delete process.env.GEMINI_API_KEY;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.GEMINI_API_KEY;
  });

  it('returns analysis on success', async () => {
    process.env.GEMINI_API_KEY = 'key';
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
  });

  it('returns 400 when fileId missing', async () => {
    process.env.GEMINI_API_KEY = 'key';
    const { POST } = await import('../src/app/api/analyze/route');
    const res = await POST(new Request('http://test', { method: 'POST', body: JSON.stringify({}) }) as any);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, error: 'No fileId provided' });
  });

  it('returns 500 when API key missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const { POST } = await import('../src/app/api/analyze/route');
    const req = new Request('http://test', { method: 'POST', body: JSON.stringify({ fileId: 'x' }) });
    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
