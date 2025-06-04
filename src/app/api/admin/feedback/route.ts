import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// Verify the request is from an authenticated admin user
async function verifyAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email ?? '' },
    select: { id: true, isAdmin: true },
  });
  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return { id: user.id };
}

export async function GET() {
  const admin = await verifyAdmin();
  if ('status' in admin) return admin as any;

  const feedback = await prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true } } },
  });

  const formatted = feedback.map(f => ({
    id: f.id,
    user: f.user.email,
    date: f.createdAt.toISOString(),
    category: f.category,
    status: f.status,
    message: f.message,
  }));

  return NextResponse.json(formatted);
}

export async function POST(req: NextRequest) {
  const admin = await verifyAdmin();
  if ('status' in admin) return admin as any;

  const { userId, message, category, status } = await req.json();
  if (!userId || !message || !category) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const item = await prisma.feedback.create({
    data: {
      userId,
      message,
      category,
      status: status || 'New',
    },
  });

  return NextResponse.json(item);
}

export async function PUT(req: NextRequest) {
  const admin = await verifyAdmin();
  if ('status' in admin) return admin as any;

  const { id, ...data } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const item = await prisma.feedback.update({ where: { id }, data });
  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest) {
  const admin = await verifyAdmin();
  if ('status' in admin) return admin as any;

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  await prisma.feedback.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
