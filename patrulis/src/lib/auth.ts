import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'patrulis_session';

export async function setAuthSession() {
  (await cookies()).set(SESSION_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 dienos
    path: '/',
  });
}

export async function clearAuthSession() {
  (await cookies()).delete(SESSION_COOKIE_NAME);
}

export async function isAuthenticated() {
  const session = (await cookies()).get(SESSION_COOKIE_NAME);
  return session?.value === 'authenticated';
}

export async function getAuthUser(): Promise<string | null> {
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    return null;
  }

  return process.env.ADMIN_USERNAME || 'admin';
}
