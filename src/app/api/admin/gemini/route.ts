import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getGeminiService } from '@/lib/gemini-service';

async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? '' },
  });
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const errorResponse = await verifyAdmin();
  if (errorResponse) return errorResponse;
  const geminiService = await getGeminiService();
  return NextResponse.json({ systemPrompt: geminiService.getSystemPrompt() });
}

export async function POST(req: NextRequest) {
  try {
    const errorResponse = await verifyAdmin();
    if (errorResponse) return errorResponse;
    const { action, value } = await req.json();
    const geminiService = await getGeminiService();

    if (action === 'updateApiKey') {
      await geminiService.updateApiKey(value);
      return NextResponse.json({ success: true });
    } else if (action === 'updateSystemPrompt') {
      await geminiService.updateSystemPrompt(value);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin gemini route error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
