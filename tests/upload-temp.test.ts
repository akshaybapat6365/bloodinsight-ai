import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';

let uploadFileMock: any;

vi.mock('@google/generative-ai/server', () => ({
  GoogleAIFileManager: vi.fn().mockImplementation(() => ({
    uploadFile: (...args: any[]) => uploadFileMock(...args)
  }))
}));

describe('POST /api/upload-temp', () => {
  beforeEach(() => {
    vi.resetModules();
    uploadFileMock = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.MAX_UPLOAD_BYTES;
    delete process.env.GEMINI_API_KEY;
  });

  it('uploads file and returns fileId', async () => {
    process.env.GEMINI_API_KEY = 'key';
    const writeSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue();
    const unlinkSpy = vi.spyOn(fs, 'unlink').mockResolvedValue();
    const fileId = 'files/123';
    uploadFileMock.mockResolvedValue({ file: { name: fileId } });

    const { POST } = await import('../src/app/api/upload-temp/route');

    const formData = new FormData();
    formData.append('file', new File(['content'], 'test.pdf', { type: 'application/pdf' }));
    const req = new Request('http://test', { method: 'POST', body: formData });

    const res = await POST(req);
    const json = await res.json();
    expect(json).toEqual({ success: true, fileId });
    expect(writeSpy).toHaveBeenCalled();
    expect(unlinkSpy).toHaveBeenCalled();
  });

  it('returns 400 when no file provided', async () => {
    process.env.GEMINI_API_KEY = 'key';
    const { POST } = await import('../src/app/api/upload-temp/route');
    const formData = new FormData();
    const req = new Request('http://test', { method: 'POST', body: formData });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, error: 'No file uploaded.' });
  });

  it('returns 500 if API key missing', async () => {
    delete process.env.GEMINI_API_KEY;
    const { POST } = await import('../src/app/api/upload-temp/route');

    const formData = new FormData();
    formData.append('file', new File(['data'], 'a.txt', { type: 'text/plain' }));
    const req = new Request('http://test', { method: 'POST', body: formData });
    const res = await POST(req);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it('returns 400 when mime type not allowed', async () => {
    process.env.GEMINI_API_KEY = 'key';
    const { POST } = await import('../src/app/api/upload-temp/route');
    const formData = new FormData();
    formData.append('file', new File(['data'], 'script.sh', { type: 'application/x-sh' }));
    const req = new Request('http://test', { method: 'POST', body: formData });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 413 when file exceeds size limit', async () => {
    process.env.GEMINI_API_KEY = 'key';
    process.env.MAX_UPLOAD_BYTES = '5';
    const { POST } = await import('../src/app/api/upload-temp/route');
    const formData = new FormData();
    formData.append('file', new File([new Uint8Array(10)], 'big.pdf', { type: 'application/pdf' }));
    const req = new Request('http://test', { method: 'POST', body: formData });
    const res = await POST(req);
    expect(res.status).toBe(413);
  });
});
