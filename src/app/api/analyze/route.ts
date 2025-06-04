import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getGeminiService } from '@/lib/gemini-service';

export async function POST(req: NextRequest) {
  const start = Date.now();
  const session = await getServerSession(authOptions).catch(() => null);
  const userRecord = session
    ? await prisma.user.findUnique({ where: { email: session.user?.email ?? '' }, select: { id: true } })
    : null;

  try {
    const { fileId } = await req.json();
    if (!fileId || typeof fileId !== 'string') {
      return NextResponse.json({ success: false, error: 'No fileId provided' }, { status: 400 });
    }

    const config = await prisma.geminiConfig.findFirst();
    const apiKey = config?.apiKey ?? process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
    }

    const geminiService = await getGeminiService();
    const systemPrompt = geminiService.getSystemPrompt();

    const genAI = new GoogleGenerativeAI(apiKey);
    const fileManager = new GoogleAIFileManager(apiKey);

    // Retrieve the previously uploaded file from Google
    const retrieved = await fileManager.retrieveFile(fileId);
    const mimeType = retrieved.mimeType || 'application/octet-stream';
    const base64Content = Buffer.from(retrieved.data).toString('base64');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro-preview-03-25',
      systemInstruction: systemPrompt,
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
    };

    const chatSession = model.startChat({ generationConfig, history: [] });

    const result = await chatSession.sendMessage([
      {
        inlineData: {
          mimeType,
          data: base64Content,
        },
      },
    ]);

    await prisma.apiUsage.create({
      data: {
        endpoint: '/api/analyze',
        duration: Date.now() - start,
        status: 'success',
        userId: userRecord?.id,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: result.response.text(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing file:', error);
    await prisma.apiUsage.create({
      data: {
        endpoint: '/api/analyze',
        duration: Date.now() - start,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        userId: userRecord?.id,
      },
    });
    return NextResponse.json({ success: false, error: 'Failed to process file' }, { status: 500 });
  }
}
