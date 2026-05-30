import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/api';
import { deleteStaff } from '@/lib/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await authGuard({ admin: true });
  if ('response' in guard) return guard.response;

  const { id } = await params;
  // Prevent admins from deleting their own account out from under themselves.
  if (id === guard.user.id) {
    return NextResponse.json({ error: 'You cannot remove your own account' }, { status: 400 });
  }
  if (!deleteStaff(id)) return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
