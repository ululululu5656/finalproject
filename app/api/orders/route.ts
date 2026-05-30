import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/api';
import { listOrders, createOrder } from '@/lib/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await authGuard();
  if ('response' in guard) return guard.response;
  return NextResponse.json({ orders: listOrders() });
}

export async function POST(req: Request) {
  const guard = await authGuard();
  if ('response' in guard) return guard.response;

  const body = await req.json().catch(() => ({}));
  const tableNumber = typeof body.tableNumber === 'string' ? body.tableNumber.trim() : '';
  const items = Array.isArray(body.items) ? body.items : [];

  if (!tableNumber) {
    return NextResponse.json({ error: 'Table number is required' }, { status: 400 });
  }
  if (items.length === 0) {
    return NextResponse.json({ error: 'An order needs at least one item' }, { status: 400 });
  }

  try {
    const order = createOrder({
      tableNumber,
      customerName: typeof body.customerName === 'string' && body.customerName.trim() ? body.customerName.trim() : undefined,
      items: items.map((i: { menuItemId: string; quantity: number }) => ({
        menuItemId: String(i.menuItemId),
        quantity: Math.max(1, Number(i.quantity) || 1),
      })),
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
