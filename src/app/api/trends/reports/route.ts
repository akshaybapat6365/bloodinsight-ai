import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user?.email ?? '' }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reports = await prisma.report.findMany({
    where: { userId: user.id },
    orderBy: { date: 'desc' },
    include: { readings: true },
  });

  const formatted = reports.map(r => ({
    id: r.id,
    userId: r.userId,
    date: r.date.toISOString(),
    name: r.name,
    fileId: r.fileId ?? r.fileUrl ?? null,
    textAnalysis: r.textAnalysis ?? null,
    readings: r.readings.map(reading => ({
      metricId: reading.metricId,
      value: reading.value,
      date: r.date.toISOString(),
      status: reading.status,
    })),
  }));

  return NextResponse.json(formatted);
}
