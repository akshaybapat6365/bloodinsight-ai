import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { getGeminiService } from '@/lib/gemini-service';

type VerifyResult = { user: { id: string } } | { error: NextResponse };

async function verifyAdmin(): Promise<VerifyResult> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? '' },
    select: { id: true, isAdmin: true },
  });
  if (!user?.isAdmin) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user: { id: user.id } };
}

export async function GET(req: NextRequest) {
  const start = Date.now();
  const result = await verifyAdmin();
  if ('error' in result) return result.error;
  const geminiService = await getGeminiService();

  const systemPrompt = geminiService.getSystemPrompt();

  // Gather usage statistics
  const totalUsers = await prisma.user.count();
  const activeUsers = await prisma.session.count({
    where: { expires: { gt: new Date() } },
    distinct: ['userId'],
  });
  const totalReports = await prisma.report.count();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const reportsToday = await prisma.report.count({ where: { createdAt: { gte: startOfToday } } });
  const apiAggregates = (await prisma.apiUsage.aggregate({
    _count: true,
    _avg: { duration: true },
  })) || { _count: 0, _avg: { duration: 0 } };

  const recent = (await prisma.apiUsage.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
  })) || [];

  const userIds = recent.map(r => r.userId).filter(Boolean) as string[];
  const users = (await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, email: true } })) || [];
  const userMap = Object.fromEntries(users.map(u => [u.id, u.email]));

  const userActivity = recent.map(r => ({
    time: r.createdAt.toISOString(),
    user: r.userId ? userMap[r.userId] || 'Unknown' : 'Anonymous',
    action: `${r.endpoint} (${r.status})`,
    duration: r.duration,
  }));

  await prisma.apiUsage.create({
    data: {
      endpoint: '/api/admin/gemini',
      duration: Date.now() - start,
      status: 'success',
      userId: result.user.id,
    },
  });

  return NextResponse.json({
    systemPrompt,
    usageStats: {
      totalUsers,
      activeUsers,
      totalReports,
      reportsToday,
      apiCalls: apiAggregates._count,
      averageProcessingTime: Math.round(apiAggregates._avg.duration ?? 0),
    },
    userActivity,
  });
}

export async function POST(req: NextRequest) {
  const start = Date.now();
  try {
    const result = await verifyAdmin();
    if ('error' in result) return result.error;
    const { action, value } = await req.json();
    const geminiService = await getGeminiService();

    let success = false;

    if (action === 'updateApiKey') {
      await geminiService.updateApiKey(value);
      success = true;
    } else if (action === 'updateSystemPrompt') {
      await geminiService.updateSystemPrompt(value);
      success = true;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    await prisma.apiUsage.create({
      data: {
        endpoint: '/api/admin/gemini',
        duration: Date.now() - start,
        status: 'success',
        userId: result.user.id,
      },
    });

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Admin gemini route error:', error);
    await prisma.apiUsage.create({
      data: {
        endpoint: '/api/admin/gemini',
        duration: Date.now() - start,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
