import { NextRequest, NextResponse } from 'next/server';
import { getGeminiService } from '@/lib/gemini-service';

export async function GET() {
  const geminiService = getGeminiService();
  return NextResponse.json({ systemPrompt: geminiService.getSystemPrompt() });
}

export async function POST(req: NextRequest) {
  try {
    const { action, value } = await req.json();
    const geminiService = getGeminiService();

    if (action === 'updateApiKey') {
      geminiService.updateApiKey(value);
      return NextResponse.json({ success: true });
    } else if (action === 'updateSystemPrompt') {
      geminiService.updateSystemPrompt(value);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Admin gemini route error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
