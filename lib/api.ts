import { NextResponse } from 'next/server';
import { getCurrentUser, type SessionUser } from './auth';

type GuardResult = { user: SessionUser } | { response: NextResponse };

/**
 * Route-handler auth guard.
 *
 *   const guard = await authGuard();           // any signed-in user
 *   const guard = await authGuard({ admin: true });  // admins only
 *   if ('response' in guard) return guard.response;
 *   // ...use guard.user
 */
export async function authGuard(opts?: { admin?: boolean }): Promise<GuardResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  if (opts?.admin && user.role !== 'admin') {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }
  return { user };
}
