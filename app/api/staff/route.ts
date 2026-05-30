import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/api';
import { hashPassword } from '@/lib/auth';
import { listStaff, createStaff, staffEmailExists } from '@/lib/repo';
import type { UserRole } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// New staff members can sign in with this default password until it's changed.
const DEFAULT_STAFF_PASSWORD = 'password123';

export async function GET() {
  const guard = await authGuard();
  if ('response' in guard) return guard.response;
  return NextResponse.json({ staff: listStaff() });
}

export async function POST(req: Request) {
  const guard = await authGuard({ admin: true });
  if ('response' in guard) return guard.response;

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const role: UserRole = body.role === 'admin' ? 'admin' : 'staff';
  const phone = typeof body.phone === 'string' && body.phone.trim() ? body.phone.trim() : undefined;

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
  }
  if (staffEmailExists(email)) {
    return NextResponse.json({ error: 'A user with that email already exists' }, { status: 409 });
  }

  const member = createStaff({ name, email, phone, role }, hashPassword(DEFAULT_STAFF_PASSWORD));
  return NextResponse.json({ member }, { status: 201 });
}
