import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

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

    const genAI = new GoogleGenerativeAI(apiKey);
    const fileManager = new GoogleAIFileManager(apiKey);

    // Retrieve the previously uploaded file from Google
    const retrieved = await fileManager.retrieveFile(fileId);
    const mimeType = retrieved.mimeType || 'application/octet-stream';
    const base64Content = Buffer.from(retrieved.data).toString('base64');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-pro-preview-03-25',
      systemInstruction: `You are BloodInsight AI, an assistant specialized in analyzing and explaining blood test and lab reports.
Your task is:
1. Extract key metrics and values from the provided lab report
2. Identify which values are within normal range and which are outside normal range
3. Provide a clear, simple explanation of what each metric means and its significance
4. Offer general insights about the overall health picture based on these results
5. Suggest potential lifestyle modifications or follow-up actions when appropriate

Important notes:
- Always clarify that your analysis is for educational purposes only and not a substitute for medical advice
- Use plain, accessible language that a non-medical person can understand
- When values are outside normal range, explain the potential implications without causing alarm
- Organize information in a structured, easy-to-read format
- Focus on factual information and avoid speculative diagnoses`,
    });

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 65536,
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
