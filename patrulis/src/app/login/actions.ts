'use server';

import { redirect } from 'next/navigation';
import { clearAuthSession, setAuthSession } from '@/lib/auth';

export async function loginAction(_prevState: unknown, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    await setAuthSession();
    redirect('/');
  }

  return { error: 'Neteisingas prisijungimo vardas arba slaptažodis.' };
}

export async function logoutAction() {
  await clearAuthSession();
  redirect('/');
}
