import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { setAuthSession } from '@/lib/auth';
import { isAdmin } from '@/lib/data/admins';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = process.env.APP_URL ?? new URL(request.url).origin;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const storedState = cookieStore.get('oauth_state')?.value;
  const codeVerifier = cookieStore.get('oauth_code_verifier')?.value;
  const redirectUri = cookieStore.get('oauth_redirect_uri')?.value;

  cookieStore.delete('oauth_state');
  cookieStore.delete('oauth_code_verifier');
  cookieStore.delete('oauth_redirect_uri');

  if (
    !code ||
    !state ||
    state !== storedState ||
    !codeVerifier ||
    !redirectUri
  ) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', origin));
  }

  const tokenRes = await fetch('https://www.openstreetmap.org/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: process.env.OSM_CLIENT_ID ?? '',
      client_secret: process.env.OSM_CLIENT_SECRET ?? '',
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/login?error=token_failed', origin));
  }

  const { access_token } = await tokenRes.json();

  const userRes = await fetch(
    'https://api.openstreetmap.org/api/0.6/user/details.json',
    {
      headers: { Authorization: `Bearer ${access_token}` },
    },
  );

  if (!userRes.ok) {
    return NextResponse.redirect(new URL('/login?error=user_failed', origin));
  }

  const { user } = await userRes.json();
  const username: string = user.display_name;

  if (!(await isAdmin(username))) {
    return NextResponse.redirect(
      new URL(
        `/login?error=noaccess&user=${encodeURIComponent(username)}`,
        origin,
      ),
    );
  }

  await setAuthSession(username);

  return NextResponse.redirect(new URL('/', origin));
}
