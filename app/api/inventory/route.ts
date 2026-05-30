import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/api';
import { listInventoryItems, createInventoryItem } from '@/lib/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await authGuard();
  if ('response' in guard) return guard.response;
  return NextResponse.json({ items: listInventoryItems() });
}

export async function POST(req: Request) {
  const guard = await authGuard({ admin: true });
  if ('response' in guard) return guard.response;

  const body = await req.json().catch(() => ({}));
  if (!body.name || !body.unit || !body.category) {
    return NextResponse.json({ error: 'Name, unit and category are required' }, { status: 400 });
  }

  const item = createInventoryItem({
    name: String(body.name),
    quantity: Number(body.quantity) || 0,
    unit: String(body.unit),
    lowStockThreshold: Number(body.lowStockThreshold) || 0,
    category: String(body.category),
  });
  return NextResponse.json({ item }, { status: 201 });
}
