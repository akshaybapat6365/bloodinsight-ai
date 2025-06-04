import { prisma } from './prisma';

export interface FeedbackRecord {
  id: string;
  userId: string;
  message: string;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createFeedback(userId: string, message: string, category: string, status = 'New'): Promise<FeedbackRecord> {
  return prisma.feedback.create({
    data: { userId, message, category, status },
  });
}

export async function updateFeedback(id: string, data: Partial<{ message: string; category: string; status: string }>): Promise<FeedbackRecord> {
  return prisma.feedback.update({ where: { id }, data });
}

export interface FeedbackItem {
  id: string;
  user: string;
  date: string;
  category: string;
  status: string;
  message: string;
}

export async function fetchFeedback(): Promise<FeedbackItem[]> {
  const res = await fetch('/api/admin/feedback');
  if (!res.ok) throw new Error('Failed to fetch feedback');
  return res.json();
}

export async function sendFeedback(data: { userId: string; message: string; category: string; }): Promise<FeedbackItem> {
  const res = await fetch('/api/admin/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to submit feedback');
  return res.json();
}

export async function updateFeedbackItem(id: string, data: { status?: string; message?: string; category?: string; }): Promise<FeedbackItem> {
  const res = await fetch('/api/admin/feedback', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  });
  if (!res.ok) throw new Error('Failed to update feedback');
  return res.json();
}

export async function deleteFeedback(id: string): Promise<void> {
  await fetch('/api/admin/feedback', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
}
