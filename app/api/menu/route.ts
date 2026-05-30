import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/api';
import { listMenuItems, createMenuItem } from '@/lib/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await authGuard();
  if ('response' in guard) return guard.response;
  return NextResponse.json({ items: listMenuItems() });
}

export async function POST(req: Request) {
  const guard = await authGuard({ admin: true });
  if ('response' in guard) return guard.response;

  const body = await req.json().catch(() => ({}));
  if (!body.name || typeof body.price !== 'number') {
    return NextResponse.json({ error: 'Name and price are required' }, { status: 400 });
  }

  const item = createMenuItem({
    name: String(body.name),
    category: body.category ?? 'Coffee',
    price: body.price,
    available: body.available ?? true,
    description: body.description ?? undefined,
  });
  return NextResponse.json({ item }, { status: 201 });
}
