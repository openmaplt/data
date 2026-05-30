import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

interface SessionData {
  username?: string;
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

export async function setAuthSession(username: string) {
  const session = await getSession();
  session.username = username;
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
