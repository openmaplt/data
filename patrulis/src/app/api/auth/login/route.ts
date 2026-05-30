import { createHash, randomBytes } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/callback`;

  const codeVerifier = randomBytes(32).toString('base64url');
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  const state = randomBytes(16).toString('hex');

  const cookieStore = await cookies();
  const opts = {
    httpOnly: true,
    path: '/',
    maxAge: 600,
    sameSite: 'lax' as const,
  };
  cookieStore.set('oauth_state', state, opts);
  cookieStore.set('oauth_code_verifier', codeVerifier, opts);
  cookieStore.set('oauth_redirect_uri', redirectUri, opts);

  const authUrl = new URL('https://www.openstreetmap.org/oauth2/authorize');
  authUrl.searchParams.set('client_id', process.env.OSM_CLIENT_ID ?? '');
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'read_prefs');
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('code_challenge', codeChallenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  return NextResponse.redirect(authUrl);
}
