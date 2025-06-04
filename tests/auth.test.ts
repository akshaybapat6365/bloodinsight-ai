import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/lib/prisma', () => ({ prisma: { user: { findUnique: vi.fn() } } }));

import { authOptions } from '../src/app/api/auth/[...nextauth]/route';

// Simple unit test for the session callback

describe('authOptions callbacks', () => {
  it('adds isAdmin from JWT to session', async () => {
    const session: any = { user: { name: 'test', email: 't@example.com', image: '' } };
    const token: any = { sub: '1', isAdmin: true };
    const result = await authOptions.callbacks!.session!({ session, token } as any);
    expect(result.user.isAdmin).toBe(true);
  });
});
