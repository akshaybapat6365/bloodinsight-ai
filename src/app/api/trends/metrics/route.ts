import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const metrics = await prisma.healthMetric.findMany({ orderBy: { name: 'asc' } });
  const formatted = metrics.map(m => ({
    id: m.id,
    name: m.name,
    unit: m.unit,
    normalRange: { min: m.minValue, max: m.maxValue },
    description: m.description ?? '',
    category: m.category,
  }));
  return NextResponse.json(formatted);
}
