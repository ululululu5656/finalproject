import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/api';
import { updateOrderStatus } from '@/lib/repo';
import type { OrderStatus } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID: OrderStatus[] = ['pending', 'preparing', 'completed', 'cancelled'];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await authGuard();
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (!VALID.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const order = updateOrderStatus(id, body.status);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json({ order });
}
