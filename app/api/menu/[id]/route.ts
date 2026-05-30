import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/api';
import { updateMenuItem, deleteMenuItem } from '@/lib/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await authGuard({ admin: true });
  if ('response' in guard) return guard.response;

  const { id } = await params;
  const patch = await req.json().catch(() => ({}));
  const item = updateMenuItem(id, patch);
  if (!item) return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
  return NextResponse.json({ item });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await authGuard({ admin: true });
  if ('response' in guard) return guard.response;

  const { id } = await params;
  if (!deleteMenuItem(id)) return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
