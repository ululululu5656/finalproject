import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { getDb } from './db';
import type { UserRole } from './types';

export const SESSION_COOKIE = 'cafeflow_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  password_hash: string;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

/** Validate an email/password pair against the users table. */
export function verifyCredentials(email: string, password: string): SessionUser | null {
  const row = getDb()
    .prepare('SELECT id, name, email, role, password_hash FROM users WHERE email = ?')
    .get(email.trim().toLowerCase()) as UserRow | undefined;
  if (!row) return null;
  if (!bcrypt.compareSync(password, row.password_hash)) return null;
  return { id: row.id, name: row.name, email: row.email, role: row.role as UserRole };
}

function issueSession(userId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  getDb()
    .prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)')
    .run(token, userId, new Date().toISOString());
  return token;
}

function revokeSession(token: string): void {
  getDb().prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

function getUserByToken(token: string): SessionUser | null {
  const row = getDb()
    .prepare(
      `SELECT u.id, u.name, u.email, u.role
       FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`,
    )
    .get(token) as Omit<UserRow, 'password_hash'> | undefined;
  return row ? { id: row.id, name: row.name, email: row.email, role: row.role as UserRole } : null;
}

/** Verify credentials, create a session, and set the session cookie. */
export async function login(email: string, password: string): Promise<SessionUser | null> {
  const user = verifyCredentials(email, password);
  if (!user) return null;
  const token = issueSession(user.id);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
  return user;
}

/** Revoke the active session and clear the cookie. */
export async function logout(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) revokeSession(token);
  store.delete(SESSION_COOKIE);
}

/** Resolve the signed-in user from the request cookie, or null. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return getUserByToken(token);
}
