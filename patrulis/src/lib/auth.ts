import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { unauthorized } from 'next/navigation';
import type { AdminRole } from '@/lib/data/admins';

interface SessionData {
  username?: string;
  role?: AdminRole;
}

const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'patrulis_session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 dienos
    path: '/',
  },
};

async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function setAuthSession(username: string, role: AdminRole) {
  const session = await getSession();
  session.username = username;
  session.role = role;
  await session.save();
}

export async function clearAuthSession() {
  const session = await getSession();
  session.destroy();
}

export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return !!session.username;
}

export async function getAuthUser(): Promise<string | null> {
  const session = await getSession();
  return session.username ?? null;
}

export async function isFullAdmin(): Promise<boolean> {
  const session = await getSession();
  return session.role === 'admin';
}

/** Throws (via next/navigation's unauthorized()) unless the caller is a full admin. */
export async function requireAdmin(): Promise<string> {
  const session = await getSession();
  if (!session.username || session.role !== 'admin') {
    unauthorized();
  }
  return session.username;
}
