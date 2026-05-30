import { NextResponse } from 'next/server';
import { authGuard } from '@/lib/api';
import { getReports } from '@/lib/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await authGuard();
  if ('response' in guard) return guard.response;
  return NextResponse.json(getReports());
}
