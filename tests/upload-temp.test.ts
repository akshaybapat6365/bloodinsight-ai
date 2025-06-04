import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';

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
  });

  it('uploads file and returns fileId', async () => {
    process.env.GEMINI_API_KEY = 'key';
    const writeSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue();
    const unlinkSpy = vi.spyOn(fs, 'unlink').mockResolvedValue();
    const fileId = 'files/123';
    uploadFileMock.mockResolvedValue({ file: { name: fileId } });

    const { POST } = await import('../src/app/api/upload-temp/route');

    const formData = new FormData();
    formData.append('file', new File(['content'], 'test.txt', { type: 'text/plain' }));
    const req = new Request('http://test', { method: 'POST', body: formData });

    const res = await POST(req);
    const json = await res.json();
    expect(json).toEqual({ success: true, fileId });
    expect(writeSpy).toHaveBeenCalled();
    expect(unlinkSpy).toHaveBeenCalled();
  });

  it('sanitizes filenames containing separators', async () => {
    process.env.GEMINI_API_KEY = 'key';
    const writeSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue();
    const unlinkSpy = vi.spyOn(fs, 'unlink').mockResolvedValue();
    uploadFileMock.mockResolvedValue({ file: { name: 'files/123' } });

    const { POST } = await import('../src/app/api/upload-temp/route');

    const trickyName = '../path/evil.txt';
    const formData = new FormData();
    formData.append('file', new File(['content'], trickyName, { type: 'text/plain' }));
    const req = new Request('http://test', { method: 'POST', body: formData });

    await POST(req);

    expect(writeSpy).toHaveBeenCalled();
    const calledPath = writeSpy.mock.calls[0][0] as string;
    const expectedBasename = path.basename(trickyName);
    expect(path.basename(calledPath)).toMatch(new RegExp(`${expectedBasename}$`));
    expect(calledPath).not.toContain(trickyName);
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

  it('uses default limit when MAX_UPLOAD_BYTES is invalid', async () => {
    process.env.GEMINI_API_KEY = 'key';
    process.env.MAX_UPLOAD_BYTES = 'invalid';
    const writeSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue();
    const unlinkSpy = vi.spyOn(fs, 'unlink').mockResolvedValue();

    const { POST, MAX_UPLOAD_BYTES } = await import('../src/app/api/upload-temp/route');

    const big = new Uint8Array(MAX_UPLOAD_BYTES + 1);
    const formData = new FormData();
    formData.append('file', new File([big], 'big.dat', { type: 'application/octet-stream' }));
    const req = new Request('http://test', { method: 'POST', body: formData });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(writeSpy).not.toHaveBeenCalled();
    expect(unlinkSpy).not.toHaveBeenCalled();
  });

  it('uses default limit when MAX_UPLOAD_BYTES has letters', async () => {
    process.env.GEMINI_API_KEY = 'key';
    process.env.MAX_UPLOAD_BYTES = '5mb';
    const writeSpy = vi.spyOn(fs, 'writeFile').mockResolvedValue();
    const unlinkSpy = vi.spyOn(fs, 'unlink').mockResolvedValue();

    const { POST, MAX_UPLOAD_BYTES } = await import('../src/app/api/upload-temp/route');

    const big = new Uint8Array(MAX_UPLOAD_BYTES + 1);
    const formData = new FormData();
    formData.append('file', new File([big], 'big.dat', { type: 'application/octet-stream' }));
    const req = new Request('http://test', { method: 'POST', body: formData });

    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(writeSpy).not.toHaveBeenCalled();
    expect(unlinkSpy).not.toHaveBeenCalled();
  });
});
